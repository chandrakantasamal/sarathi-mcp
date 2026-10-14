// Mocked origin responses with partner-order restrictions
const orderDB = {
  'order123': { status: 'shipped', eta: '2026-10-15', partnerOwner: 'partner1' },
  'order456': { status: 'processing', eta: '2026-10-18', partnerOwner: 'partner1' },
  'order789': { status: 'delivered', eta: '2026-10-10', partnerOwner: 'partner2' },
  'order000': { status: 'cancelled', eta: null, partnerOwner: 'partner1' }
};

// Define which partners can access which orders
const partnerPermissions = {
  'partner1': {
    apiKey: 'key123',
    allowedOrders: ['order123', 'order456', 'order000'] // Can only access their own orders
  },
  'partner2': {
    apiKey: 'key456',
    allowedOrders: ['order789'] // Can only access their own orders
  },
  'partner3': {
    apiKey: 'key789',
    allowedOrders: [] // No order access (for testing)
  }
};

export function getOrderStatus(partnerId, orderId) {
  // Check if partner exists
  if (!partnerPermissions[partnerId]) {
    throw new Error(`Partner ${partnerId} not found`);
  }

  // Check if order exists
  if (!orderDB[orderId]) {
    throw new Error(`Order ${orderId} not found`);
  }

  // Check if this partner is allowed to access this order
  if (!partnerPermissions[partnerId].allowedOrders.includes(orderId)) {
    throw new Error(`Partner ${partnerId} is not authorized to access order ${orderId}`);
  }

  // Simulate occasional origin failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Origin server timeout");
  }

  return orderDB[orderId];
}

// Export for testing
export { partnerPermissions, orderDB };
