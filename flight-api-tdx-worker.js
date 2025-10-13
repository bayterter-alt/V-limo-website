/**
 * Cloudflare Worker - TDX 航班 API 代理
 * 使用台湾交通部运输数据流通服务
 */

// 設定 CORS 標頭
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ⚡ Token 快取（避免頻繁請求）
let cachedToken = null;
let tokenExpiry = 0;

// ⚡ 查詢結果快取，降低重複請求與 429 機率
const flightResultCache = new Map(); // key: flightNumber, value: { data, expiry }
const RESULT_CACHE_TTL_MS = 60 * 1000; // 60 秒快取

// ⚡ 全域節流：最多 5 次/60 秒 對上游 TDX FIDS 的請求
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
let upstreamRequestTimestamps = [];

function isRateLimited() {
  const now = Date.now();
  upstreamRequestTimestamps = upstreamRequestTimestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  return upstreamRequestTimestamps.length >= RATE_LIMIT_MAX;
}

function canPerformUpstreamRequest() {
  if (isRateLimited()) return false;
  const now = Date.now();
  upstreamRequestTimestamps = upstreamRequestTimestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  upstreamRequestTimestamps.push(now);
  return true;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxRetries = 1) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await fetch(url, options);
    if (response.status !== 429 || attempt >= maxRetries) {
      return response;
    }
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 400 + Math.floor(Math.random() * 600);
    console.warn(`⏳ [TDX API] 429 received. Backing off for ${retryMs} ms (attempt ${attempt + 1}/${maxRetries})`);
    await sleep(retryMs);
    attempt += 1;
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event));
});

async function handleRequest(request, event) {
  // ✅ 從環境變數讀取 TDX API 憑證（安全方式）
  // 在 Cloudflare Workers 中，環境變數通過 env 對象訪問
  const env = event?.env || globalThis;
  const TDX_CLIENT_ID = env.TDX_ID || '';
  const TDX_CLIENT_SECRET = env.TDX_SECRET || '';
  
  console.log('🔧 [Worker Init] Environment check');
  console.log('   TDX_ID available:', !!TDX_CLIENT_ID);
  console.log('   TDX_SECRET available:', !!TDX_CLIENT_SECRET);
  // 處理 CORS 預檢請求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // 只允許 GET 請求
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  const url = new URL(request.url);
  const flightNumber = url.searchParams.get('flight');

  if (!flightNumber) {
    return new Response(JSON.stringify({
      error: 'Missing flight number parameter'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  try {
    // 先檢查快取結果（短期 30 秒）
    const cached = flightResultCache.get(flightNumber);
    if (cached && cached.expiry > Date.now()) {
      console.log('⚡ [Cache] Returning cached flight result for', flightNumber);
      return new Response(JSON.stringify(cached.data), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // 全域節流：超出上限直接回前端 429，請稍後再試
    if (isRateLimited()) {
      const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS) / 1000);
      return new Response(JSON.stringify({
        error: 'rate_limited',
        message: '查詢過於頻繁，請稍後再試',
        retryAfterSeconds: retryAfterSec
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfterSec),
          ...corsHeaders
        }
      });
    }
    // 步驟 1: 取得 TDX Access Token
    const accessToken = await getTDXAccessToken(TDX_CLIENT_ID, TDX_CLIENT_SECRET);
    
    if (!accessToken) {
      throw new Error('Failed to get TDX access token');
    }

    // 步驟 2: 查詢航班資訊
    const flightData = await searchTDXFlight(flightNumber, accessToken);
    
    if (!flightData) {
      return new Response(JSON.stringify({
        error: 'Flight not found',
        flightNumber: flightNumber,
        hint: '請確認航班號碼，或該航班今天可能沒有班次'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 步驟 3: 格式化並返回數據（並寫入短期快取）
    // 只將非錯誤結果寫入快取
    flightResultCache.set(flightNumber, { data: flightData, expiry: Date.now() + RESULT_CACHE_TTL_MS });
    return new Response(JSON.stringify(flightData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('TDX API Error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch flight data',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * 取得 TDX Access Token（帶快取）
 */
async function getTDXAccessToken(clientId, clientSecret) {
  // ⚡ 檢查快取的 Token 是否仍然有效
  const now = Date.now();
  if (cachedToken && tokenExpiry > now) {
    const remainingMinutes = Math.floor((tokenExpiry - now) / 1000 / 60);
    console.log('⚡ [TDX Auth] Using cached token');
    console.log('   Remaining time:', remainingMinutes, 'minutes');
    return cachedToken;
  }
  
  const authUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  
  // 🔍 調試：檢查環境變數
  console.log('🔐 [TDX Auth] Checking credentials...');
  console.log('   Client ID exists:', !!clientId);
  console.log('   Client Secret exists:', !!clientSecret);
  console.log('   Client ID length:', clientId?.length || 0);
  
  if (!clientId || !clientSecret) {
    console.error('❌ [TDX Auth] Missing credentials!');
    console.error('   Client ID:', clientId ? 'SET' : 'MISSING');
    console.error('   Client Secret:', clientSecret ? 'SET' : 'MISSING');
    return null;
  }
  
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  try {
    console.log('📤 [TDX Auth] Requesting NEW access token...');
    console.log('   URL:', authUrl);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    console.log('📥 [TDX Auth] Response received');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TDX Auth] Token request failed!');
      console.error('   Status:', response.status);
      console.error('   Error:', errorText);
      return null;
    }

    const data = await response.json();
    
    if (data.access_token) {
      // ⚡ 快取 Token（設定過期時間為實際時間減 5 分鐘，提供緩衝）
      cachedToken = data.access_token;
      const expiresIn = data.expires_in || 86400; // 預設 24 小時
      tokenExpiry = Date.now() + (expiresIn - 300) * 1000; // 減 5 分鐘緩衝
      
      console.log('✅ [TDX Auth] Access token obtained and cached');
      console.log('   Token length:', data.access_token.length);
      console.log('   Token preview:', data.access_token.substring(0, 20) + '...');
      console.log('   Expires in:', expiresIn, 'seconds');
      console.log('   Cache until:', new Date(tokenExpiry).toISOString());
      return data.access_token;
    } else {
      console.error('❌ [TDX Auth] No access_token in response');
      console.error('   Response data:', JSON.stringify(data));
      return null;
    }
  } catch (error) {
    console.error('❌ [TDX Auth] Exception:', error.message);
    console.error('   Stack:', error.stack);
    return null;
  }
}

/**
 * 查詢 TDX 航班資訊
 */
async function searchTDXFlight(flightNumber, accessToken) {
  // 單次每個機場只請求一次，減少速率壓力
  const airports = ['TPE', 'TSA'];
  for (const airport of airports) {
    const result = await searchFlightsByType(airport, 'ANY', flightNumber, accessToken);
    if (result) return result;
  }
  return null;
}

/**
 * 依類型查詢航班（出發/抵達）
 */
async function searchFlightsByType(airportCode, type, flightNumber, accessToken) {
  // D = Departure (出發), A = Arrival (抵達)
  // 注意：FIDS 結構在不同場站欄位名稱可能略異（如 FlightNo/FlightNO/FlightNumber）。
  // 為避免 OData 欄位名不相容造成 400，我們不使用 $filter，改為取回後在 Worker 端過濾。
  const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Air/FIDS/Airport/${airportCode}?$format=JSON`;
  
  console.log(`🔍 [TDX API] Searching ${airportCode} for ${flightNumber}...`);
  console.log(`   URL: ${apiUrl}`);
  console.log(`   Token exists: ${!!accessToken}`);
  
  try {
    // 全域節流：超出上限時直接返回 null，避免觸發 429
    if (!canPerformUpstreamRequest()) {
      console.warn('🚦 [TDX API] Global rate limit hit (5/min). Skipping upstream call.');
      return null;
    }

    const response = await fetchWithRetry(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }, 1);

    console.log(`📥 [TDX API] Response from ${airportCode}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [TDX API] Request failed for ${airportCode}`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText}`);
      return null;
    }

    const list = await response.json();
    console.log(`   Results: ${list?.length || 0} flights fetched (pre-filter)`);

    // 正規化輸入的航班號（去空白、去連字號、轉大寫）
    const wanted = normalizeFlightNumber(flightNumber);

    // 本地過濾：嘗試多種欄位名（FlightNumber / FlightNo / FlightNO / FlightNbr / Flight）
    const matched = (list || []).find(rec => {
      const candidates = getRecordFlightCandidates(rec);
      if (!candidates.length) return false;
      const anyMatch = candidates.some(c => normalizeFlightNumber(c) === wanted);
      if (!anyMatch) return false;
      const hasDep = !!rec.ScheduleDepartureTime;
      const hasArr = !!rec.ScheduleArrivalTime;
      return hasDep || hasArr;
    });

    if (matched) {
      console.log(`✅ [TDX API] Flight ${flightNumber} matched at ${airportCode}`);
      return formatTDXFlightData(matched, airportCode);
    }
  } catch (error) {
    console.error(`❌ [TDX API] Exception searching ${airportCode}:`, error.message);
  }
  
  return null;
}

/**
 * 格式化 TDX 航班數據
 */
function formatTDXFlightData(flight, airportCode) {
  const isDeparture = flight.ScheduleDepartureTime != null;
  
  return {
    flightNumber: getRecordFlightNumber(flight),
    airline: flight.AirlineID || flight.AirlineName?.Zh_tw || 'Unknown',
    status: translateStatus(flight.FlightStatus),
    departure: {
      airport: isDeparture ? 
        (airportCode === 'TPE' ? '台灣桃園國際機場' : '台北松山機場') : 
        (flight.DepartureAirportName?.Zh_tw || flight.DepartureAirportID),
      iata: isDeparture ? airportCode : flight.DepartureAirportID,
      icao: isDeparture ? (airportCode === 'TPE' ? 'RCTP' : 'RCSS') : '',
      terminal: flight.Terminal || '',
      gate: flight.Gate || '',
      scheduled: flight.ScheduleDepartureTime,
      estimated: flight.EstimatedDepartureTime,
      actual: flight.ActualDepartureTime,
      timezone: 'Asia/Taipei'
    },
    arrival: {
      airport: !isDeparture ? 
        (airportCode === 'TPE' ? '台灣桃園國際機場' : '台北松山機場') : 
        (flight.ArrivalAirportName?.Zh_tw || flight.ArrivalAirportID),
      iata: !isDeparture ? airportCode : flight.ArrivalAirportID,
      icao: !isDeparture ? (airportCode === 'TPE' ? 'RCTP' : 'RCSS') : '',
      terminal: flight.Terminal || '',
      gate: flight.Gate || '',
      scheduled: flight.ScheduleArrivalTime,
      estimated: flight.EstimatedArrivalTime,
      actual: flight.ActualArrivalTime,
      timezone: 'Asia/Taipei'
    },
    aircraft: null,
    source: 'TDX'
  };
}

/**
 * 轉換航班狀態
 */
function translateStatus(status) {
  const statusMap = {
    '0': 'scheduled',    // 預定
    '1': 'active',       // 起飛
    '2': 'landed',       // 降落
    '3': 'cancelled',    // 取消
    '4': 'delayed'       // 延遲
  };
  return statusMap[status] || 'scheduled';
}

/**
 * 從記錄中提取航班號，兼容不同欄位名稱
 */
function getRecordFlightNumber(rec) {
  return (
    rec.FlightNumber ||
    rec.FlightNo ||
    rec.FlightNO ||
    rec.FlightNbr ||
    rec.Flight ||
    ''
  );
}

// 有些資料會把多段共飛碼裝在同一欄位（以空白、斜線、逗號分隔）
function getRecordFlightCandidates(rec) {
  const raw = getRecordFlightNumber(rec);
  if (!raw) return [];
  return String(raw)
    .split(/[\s,/]+/)
    .filter(Boolean);
}

/**
 * 正規化航班號：移除空白/連字號，轉大寫
 */
function normalizeFlightNumber(no) {
  if (!no || typeof no !== 'string') return '';
  return no.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
}

