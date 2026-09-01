// services/messagingService.js
// Mocked messaging — simulates WhatsApp/SMS sending in hackathon context
// Returns a simulated delivery result without making real API calls

const MOCK_FAILURE_RATE = 0.08; // 8% simulated delivery failure for realism

/**
 * Send a win-back discount message to a lapsed customer.
 * @param {object} customer  - { customer_id, name, phone, email }
 * @param {object} payload   - { discount_code, discount_percent, payment_link }
 */
async function sendWinBackMessage(customer, payload) {
  await _simulateLatency();
  const success = Math.random() > MOCK_FAILURE_RATE;

  const message = `Hi ${customer.name}! We miss you at Vyapar Store. Use code *${payload.discount_code}* for ${payload.discount_percent}% off your next purchase. Pay here: ${payload.payment_link || 'https://rzp.io/mock'}`;

  if (!success) {
    return {
      delivered: false,
      channel: 'whatsapp',
      to: customer.phone || customer.email,
      message,
      error: 'DELIVERY_FAILED: Simulated network failure',
      simulated: true,
    };
  }

  return {
    delivered: true,
    channel: 'whatsapp',
    to: customer.phone || customer.email,
    message,
    message_id: `mock_msg_${Date.now()}`,
    simulated: true,
  };
}

/**
 * Send a basket-shrink upsell message.
 * @param {object} customer  - { customer_id, name, phone, email }
 * @param {object} payload   - { bundle_name, bundle_price, original_avg }
 */
async function sendBasketUpsellMessage(customer, payload) {
  await _simulateLatency();
  const success = Math.random() > MOCK_FAILURE_RATE;

  const amountDiff = ((payload.bundle_price - payload.original_avg) / 100).toFixed(0);
  const message = `Hi ${customer.name}! Try our *${payload.bundle_name}* bundle — only ₹${(payload.bundle_price / 100).toFixed(0)}. Just ₹${amountDiff} more than your usual order!`;

  if (!success) {
    return {
      delivered: false,
      channel: 'whatsapp',
      to: customer.phone || customer.email,
      message,
      error: 'DELIVERY_FAILED: Simulated timeout',
      simulated: true,
    };
  }

  return {
    delivered: true,
    channel: 'whatsapp',
    to: customer.phone || customer.email,
    message,
    message_id: `mock_msg_${Date.now()}`,
    simulated: true,
  };
}

// Simulates realistic async latency (50–300ms)
function _simulateLatency() {
  const delay = 50 + Math.random() * 250;
  return new Promise(resolve => setTimeout(resolve, delay));
}

module.exports = { sendWinBackMessage, sendBasketUpsellMessage };
