import { getOrderStatus, partnerPermissions } from './mockOrigin.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/mcp' && request.method === 'POST') {
      return handleMCPRequest(request);
    }

    if (path === '/api/order-status' && request.method === 'GET') {
      return handleHTTPRequest(url);
    }

    return new Response('Not found', { status: 404 });
  }
};

async function handleMCPRequest(request) {
  try {
    const { tool, arguments: args } = await request.json();
    const partnerId = args?.partnerId;

    if (tool !== 'get_order_status') {
      return new Response(JSON.stringify({ error: 'Unknown tool' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Input validation
    if (!args || !partnerId || !args.orderId) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: partnerId and orderId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Partner authentication
    const apiKey = request.headers.get('X-Partner-Key');
    if (!isValidPartner(apiKey, partnerId)) {
      console.error(`[AUTH] Invalid credentials for partner ${partnerId}`);
      return new Response(JSON.stringify({
        error: 'Invalid partner credentials'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get order status (will validate order access)
    const status = getOrderStatus(partnerId, args.orderId);

    return new Response(JSON.stringify({
      result: {
        orderId: args.orderId,
        status: status.status,
        eta: status.eta
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`[MCP] Error for partner ${args?.partnerId || 'unknown'}:`, error.message);
    return new Response(JSON.stringify({
      error: 'Failed to get order status',
      details: error.message
    }), {
      status: getStatusCode(error.message),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleHTTPRequest(url) {
  try {
    const partnerId = url.searchParams.get('partnerId');
    const orderId = url.searchParams.get('orderId');
    const apiKey = url.searchParams.get('apiKey');

    if (!partnerId || !orderId) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isValidPartner(apiKey, partnerId)) {
      console.error(`[AUTH] Invalid credentials for partner ${partnerId}`);
      return new Response(JSON.stringify({
        error: 'Invalid partner credentials'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const status = getOrderStatus(partnerId, orderId);

    return new Response(JSON.stringify({
      orderId,
      status: status.status,
      eta: status.eta
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`[HTTP] Error for partner ${partnerId || 'unknown'}:`, error.message);
    return new Response(JSON.stringify({
      error: 'Failed to get order status',
      details: error.message
    }), {
      status: getStatusCode(error.message),
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function isValidPartner(apiKey, partnerId) {
  return partnerPermissions[partnerId]?.apiKey === apiKey;
}

// Helper to return appropriate HTTP status codes
function getStatusCode(errorMessage) {
  if (errorMessage.includes('not found')) return 404;
  if (errorMessage.includes('not authorized')) return 403;
  if (errorMessage.includes('timeout')) return 504;
  return 500;
}
