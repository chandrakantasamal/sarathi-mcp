import { getOrderStatus, partnerPermissions } from './mockOrigin.js';

// Helper to return consistent JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    },
  });
}

// Helper to determine HTTP status code from error messages
function getStatusCode(errorMessage) {
  if (errorMessage.includes('not found')) return 404;
  if (errorMessage.includes('not authorized')) return 403;
  if (errorMessage.includes('timeout')) return 504;
  return 500;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle OPTIONS for CORS preflight
    if (request.method === 'OPTIONS') {
      return jsonResponse({}, 200);
    }

    // MCP endpoint
    if (path === '/mcp' && request.method === 'POST') {
      console.log("Inside MCP chandra");
      return handleMCPRequest(request);
    }

    // Plain HTTP endpoint (alternative)
    if (path === '/api/order-status' && request.method === 'GET') {
      return handleHTTPRequest(url);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  }
};

async function handleMCPRequest(request) {
  let partnerId = 'unknown'; // Default fallback
  let orderId = 'unknown';   // Default fallback

  try {
    // Parse request body
    const body = await request.json();
    const { tool, arguments: args } = body;

    // Extract partnerId and orderId for logging
    partnerId = args?.partnerId || 'unknown';
    orderId = args?.orderId || 'unknown';

    // Validate tool
    if (tool !== 'get_order_status') {
      return jsonResponse({ error: 'Unknown tool' }, 400);
    }

    // Input validation
    if (!args || !partnerId || !orderId) {
      return jsonResponse({
        error: 'Missing required parameters: partnerId and orderId'
      }, 400);
    }

    // Partner authentication
    const apiKey = request.headers.get('X-Partner-Key');
    if (!isValidPartner(apiKey, partnerId)) {
      console.error(`[AUTH] Invalid credentials for partner ${partnerId}`);
      return jsonResponse({
        error: 'Invalid partner credentials'
      }, 403);
    }

    // Get order status (will validate order access)
    const status = getOrderStatus(partnerId, orderId);

    return jsonResponse({
      result: {
        orderId,
        status: status.status,
        eta: status.eta
      }
    });

  } catch (error) {
    console.error(`[MCP] Error for partner ${partnerId} (order: ${orderId}):`, error.message);
    return jsonResponse({
      error: 'Failed to get order status',
      details: error.message
    }, getStatusCode(error.message));
  }
}

async function handleHTTPRequest(url) {
  let partnerId = 'unknown';
  let orderId = 'unknown';

  try {
    partnerId = url.searchParams.get('partnerId') || 'unknown';
    orderId = url.searchParams.get('orderId') || 'unknown';
    const apiKey = url.searchParams.get('apiKey');

    if (!partnerId || partnerId === 'unknown' || !orderId || orderId === 'unknown') {
      return jsonResponse({
        error: 'Missing required parameters: partnerId and orderId'
      }, 400);
    }

    if (!isValidPartner(apiKey, partnerId)) {
      console.error(`[AUTH] Invalid credentials for partner ${partnerId}`);
      return jsonResponse({
        error: 'Invalid partner credentials'
      }, 403);
    }

    const status = getOrderStatus(partnerId, orderId);

    return jsonResponse({
      orderId,
      status: status.status,
      eta: status.eta
    });

  } catch (error) {
    console.error(`[HTTP] Error for partner ${partnerId} (order: ${orderId}):`, error.message);
    return jsonResponse({
      error: 'Failed to get order status',
      details: error.message
    }, getStatusCode(error.message));
  }
}

// Partner validation helper
function isValidPartner(apiKey, partnerId) {
  return partnerPermissions[partnerId]?.apiKey === apiKey;
}
