// controllers/webhookController.js
// Handles incoming Razorpay webhook events (real OR simulated)
// Processes payment.captured and payment.failed events

const { TransactionModel } = require('../models/Transaction');
const { processPaymentEvent } = require('../services/agentEngine');

async function handleWebhook(req, res) {
  const { event, payload } = req.body;

  // Only handle payment events
  const supportedEvents = ['payment.captured', 'payment.failed'];
  if (!supportedEvents.includes(event)) {
    return res.status(200).json({ received: true, processed: false, reason: `Event "${event}" not handled` });
  }

  try {
    const payment = payload?.payment?.entity;
    if (!payment) {
      return res.status(400).json({ error: 'Invalid payload: missing payment entity' });
    }

    console.log(`[Webhook] Received ${event} — payment_id: ${payment.id}, amount: ₹${payment.amount / 100}`);

    // 1. Persist transaction
    await TransactionModel.create({
      razorpay_payment_id: payment.id,
      razorpay_order_id:   payment.order_id || null,
      customer_id:         payment.email || payment.contact || 'unknown',
      customer_name:       payment.notes?.name || 'Unknown',
      customer_email:      payment.email || '',
      customer_phone:      payment.contact || '',
      amount:              payment.amount,
      currency:            payment.currency || 'INR',
      status:              event === 'payment.captured' ? 'captured' : 'failed',
      method:              payment.method || 'upi',
      description:         payment.description || '',
      notes:               payment.notes || {},
      captured_at:         new Date(payment.created_at ? payment.created_at * 1000 : Date.now()),
    });

    // 2. Run the agent engine asynchronously (don't block webhook response)
    processPaymentEvent({
      ...payment,
      status: event === 'payment.captured' ? 'captured' : 'failed',
    }).catch(err => console.error('[Agent] Error processing event:', err.message));

    res.status(200).json({
      success: true,
      event,
      payment_id: payment.id,
      simulated:  req.simulationMode || false,
    });

  } catch (err) {
    console.error('[Webhook] Processing error:', err.message);
    // Still return 200 to Razorpay (best practice — don't make Razorpay retry)
    res.status(200).json({ success: false, error: err.message });
  }
}

module.exports = { handleWebhook };
