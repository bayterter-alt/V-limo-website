/**
 * Cloudflare Worker - 航班 API 代理
 * 用於保護 AviationStack API Key
 */

// 設定 CORS 標頭
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

  // ✅ 已配置 AviationStack API Key
  const AVIATIONSTACK_API_KEY = '702550fe61e049b7843ec3ba143a820b'; 

  try {
    // 調用 AviationStack API
    const apiUrl = `https://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&flight_iata=${flightNumber}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    // 檢查是否有錯誤
    if (data.error) {
      return new Response(JSON.stringify({
        error: data.error.message || 'API Error'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 檢查是否有航班數據
    if (!data.data || data.data.length === 0) {
      return new Response(JSON.stringify({
        error: 'Flight not found',
        flightNumber: flightNumber
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 提取第一個航班資料並格式化
    const flight = data.data[0];
    const formattedData = {
      flightNumber: flight.flight.iata || flightNumber,
      airline: flight.airline.name,
      status: flight.flight_status,
      departure: {
        airport: flight.departure.airport,
        iata: flight.departure.iata,
        icao: flight.departure.icao,
        terminal: flight.departure.terminal,
        gate: flight.departure.gate,
        scheduled: flight.departure.scheduled,
        estimated: flight.departure.estimated,
        actual: flight.departure.actual,
        timezone: flight.departure.timezone
      },
      arrival: {
        airport: flight.arrival.airport,
        iata: flight.arrival.iata,
        icao: flight.arrival.icao,
        terminal: flight.arrival.terminal,
        gate: flight.arrival.gate,
        scheduled: flight.arrival.scheduled,
        estimated: flight.arrival.estimated,
        actual: flight.arrival.actual,
        timezone: flight.arrival.timezone
      },
      aircraft: flight.aircraft ? {
        registration: flight.aircraft.registration,
        iata: flight.aircraft.iata,
        icao: flight.aircraft.icao
      } : null
    };

    return new Response(JSON.stringify(formattedData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
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

