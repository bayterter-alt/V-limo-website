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

    // 步驟 3: 格式化並返回數據
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
 * 取得 TDX Access Token
 */
async function getTDXAccessToken(clientId, clientSecret) {
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
    console.log('📤 [TDX Auth] Requesting access token...');
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
      console.log('✅ [TDX Auth] Access token obtained successfully');
      console.log('   Token length:', data.access_token.length);
      console.log('   Token preview:', data.access_token.substring(0, 20) + '...');
      console.log('   Expires in:', data.expires_in, 'seconds');
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
  // TDX API 需要分別查詢桃園機場和松山機場
  const airports = ['TPE', 'TSA'];
  
  for (const airport of airports) {
    // 查詢出發航班
    const departures = await searchFlightsByType(airport, 'D', flightNumber, accessToken);
    if (departures) return departures;
    
    // 查詢抵達航班
    const arrivals = await searchFlightsByType(airport, 'A', flightNumber, accessToken);
    if (arrivals) return arrivals;
  }
  
  return null;
}

/**
 * 依類型查詢航班（出發/抵達）
 */
async function searchFlightsByType(airportCode, type, flightNumber, accessToken) {
  // D = Departure (出發), A = Arrival (抵達)
  const apiUrl = `https://tdx.transportdata.tw/api/basic/v2/Air/FIDS/Airport/${airportCode}?$filter=FlightNumber eq '${flightNumber}' and ScheduleDepartureTime ne null&$format=JSON`;
  
  console.log(`🔍 [TDX API] Searching ${airportCode} for ${flightNumber}...`);
  console.log(`   URL: ${apiUrl}`);
  console.log(`   Token exists: ${!!accessToken}`);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

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

    const data = await response.json();
    console.log(`   Results: ${data?.length || 0} flights found`);
    
    if (data && data.length > 0) {
      const flight = data[0];
      console.log(`✅ [TDX API] Flight ${flightNumber} found at ${airportCode}`);
      
      // 格式化為統一格式
      return formatTDXFlightData(flight, airportCode);
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
    flightNumber: flight.FlightNumber,
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

