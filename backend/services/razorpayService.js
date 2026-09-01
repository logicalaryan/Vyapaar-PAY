// services/razorpayService.js
// Razorpay API helpers — create payment links, fetch payment details
// Uses Razorpay Test Mode API keys

const razorpay = require('../config/razorpay');

/**
 * Create a Razorpay payment link (for sending to customers)
 * @param {object} options - { amount (paise), customer, description }
 */
async function createPaymentLink({ amount, customer, description = 'Vyapar Store Payment' }) {
  try {
    const link = await razorpay.paymentLink.create({
      amount,
      currency:  'INR',
      description,
      customer: {
        name:    customer.name,
        email:   customer.email,
        contact: customer.phone,
      },
      notify: { sms: false, email: false }, // we handle our own messaging
      reminder_enable: false,
    });
    return { success: true, url: link.short_url, id: link.id };
  } catch (err) {
    console.error('[Razorpay] Payment link creation failed:', err.message);
    // Return a mock link so demos don't break when keys are invalid
    return { success: false, url: 'https://rzp.io/mock-link', error: err.message };
  }
}

/**
 * Fetch a payment by ID from Razorpay (for verification)
 */
async function fetchPayment(paymentId) {
  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (err) {
    console.error('[Razorpay] Fetch payment failed:', err.message);
    return null;
  }
}

module.exports = { createPaymentLink, fetchPayment };
