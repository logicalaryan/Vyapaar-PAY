// middlewares/verifyWebhook.js
// Verifies Razorpay webhook signature using HMAC-SHA256
// In simulation mode (no real webhook secret), skips verification with a warning

const crypto = require('crypto');

function verifyWebhook(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;

  // Simulation mode — skip signature check
  if (!secret || secret === 'your_webhook_secret_here') {
    console.warn('[Webhook] WEBHOOK_SECRET not set — skipping signature verification (simulation mode)');
    req.webhookVerified = false;
    req.simulationMode = true;
    return next();
  }

  const receivedSignature = req.headers['x-razorpay-signature'];
  if (!receivedSignature) {
    return res.status(400).json({ error: 'Missing X-Razorpay-Signature header' });
  }

  try {
    // Razorpay sends the raw body, so we need rawBody (set by express.json verify option)
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== receivedSignature) {
      console.error('[Webhook] Signature mismatch — rejecting request');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    req.webhookVerified = true;
    req.simulationMode = false;
    next();
  } catch (err) {
    console.error('[Webhook] Verification error:', err.message);
    return res.status(500).json({ error: 'Signature verification failed' });
  }
}

module.exports = verifyWebhook;
