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

// ✅ 從環境變數讀取 TDX API 憑證（安全方式）
// 不要在代碼中硬編碼敏感資訊！
const TDX_CLIENT_ID = typeof TDX_ID !== 'undefined' ? TDX_ID : '';
const TDX_CLIENT_SECRET = typeof TDX_SECRET !== 'undefined' ? TDX_SECRET : '';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
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
    const accessToken = await getTDXAccessToken();
    
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
async function getTDXAccessToken() {
  const authUrl = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
  
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: TDX_CLIENT_ID,
    client_secret: TDX_CLIENT_SECRET
  });

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error);
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
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data && data.length > 0) {
      const flight = data[0];
      
      // 格式化為統一格式
      return formatTDXFlightData(flight, airportCode);
    }
  } catch (error) {
    console.error(`Error searching ${type} flights:`, error);
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

