// simulateWebhook.js
// ─────────────────────────────────────────────────────────────────────────────
// Replaces Razorpay real webhooks (no ngrok, no verified URL needed).
// Posts realistic payment.captured / payment.failed payloads to your local
// /webhook endpoint using Razorpay's documented exact schema.
//
// Usage:
//   node simulateWebhook.js              — sends 15 events automatically, then exits
//   node simulateWebhook.js --stream     — streams events every 3 seconds continuously
//   node simulateWebhook.js --lapsed     — forces a lapsed customer scenario
//   node simulateWebhook.js --shrink     — forces a basket-shrink scenario
//
// Track 1 (Razorpay Buildathon): Autonomous merchant agent use case.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const http    = require('http');
const crypto  = require('crypto');
const { v4: uuidv4 } = require('uuid');

const WEBHOOK_URL  = `http://localhost:${process.env.PORT || 5000}/webhook`;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// ── Realistic merchant customer pool ─────────────────────────────────────────
const CUSTOMERS = [
  { name: 'Ravi Kumar',    email: 'ravi.kumar@gmail.com',   contact: '+919876543210' },
  { name: 'Priya Sharma',  email: 'priya.sharma@gmail.com', contact: '+919123456789' },
  { name: 'Amit Singh',    email: 'amit.singh@outlook.com', contact: '+918765432109' },
  { name: 'Sunita Devi',   email: 'sunita.devi@yahoo.com',  contact: '+917654321098' },
  { name: 'Rohit Gupta',   email: 'rohit.gupta@gmail.com',  contact: '+916543210987' },
  { name: 'Meena Joshi',   email: 'meena.joshi@gmail.com',  contact: '+915432109876' },
  { name: 'Deepak Rao',    email: 'deepak.rao@gmail.com',   contact: '+914321098765' },
  { name: 'Kavita Patel',  email: 'kavita.patel@gmail.com', contact: '+913210987654' },
];

const METHODS  = ['upi', 'card', 'netbanking', 'wallet'];
const AMOUNTS  = [14900, 19900, 24900, 29900, 34900, 39900, 49900, 59900, 9900, 7900];

// ── Build a realistic Razorpay payment.captured payload ───────────────────────
function buildPaymentPayload(event, overrides = {}) {
  const customer = overrides.customer || CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  const amount   = overrides.amount   || AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
  const method   = overrides.method   || METHODS[Math.floor(Math.random() * METHODS.length)];
  const paymentId = `pay_${uuidv4().replace(/-/g, '').substring(0, 14)}`;
  const orderId   = `order_${uuidv4().replace(/-/g, '').substring(0, 14)}`;
  const createdAt = overrides.created_at || Math.floor(Date.now() / 1000);

  // Exact Razorpay webhook schema (documented at razorpay.com/docs/webhooks)
  return {
    entity:   'event',
    account_id: 'acc_buildathon_mock',
    event,
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id:          paymentId,
          entity:      'payment',
          amount,
          currency:    'INR',
          status:      event === 'payment.captured' ? 'captured' : 'failed',
          order_id:    orderId,
          description: `Purchase at Vyapar Store`,
          international: false,
          method,
          amount_refunded: 0,
          refund_status:   null,
          captured:        event === 'payment.captured',
          email:           customer.email,
          contact:         customer.contact,
          notes: {
            name:    customer.name,
            source:  'vyapar_store',
          },
          fee:         Math.round(amount * 0.02),
          tax:         Math.round(amount * 0.002),
          error_code:  event === 'payment.failed' ? 'BAD_REQUEST_ERROR' : null,
          error_description: event === 'payment.failed' ? 'Payment failed due to insufficient funds' : null,
          error_source:      event === 'payment.failed' ? 'customer' : null,
          error_step:        event === 'payment.failed' ? 'payment_authorization' : null,
          error_reason:      event === 'payment.failed' ? 'payment_failed' : null,
          card_id:   null,
          bank:      method === 'netbanking' ? 'HDFC' : null,
          wallet:    method === 'wallet' ? 'paytm' : null,
          vpa:       method === 'upi' ? `${customer.name.toLowerCase().replace(' ', '.')}@upi` : null,
          created_at: createdAt,
        },
      },
    },
    created_at: createdAt,
  };
}

// ── Build lapsed customer scenario ─────────────────────────────────────────────
// Sets created_at to 35 days ago so the agent detects lapse immediately
function buildLapsedScenario() {
  const customer = CUSTOMERS[0]; // Ravi Kumar
  const thirtyFiveDaysAgo = Math.floor((Date.now() - 35 * 24 * 60 * 60 * 1000) / 1000);
  return buildPaymentPayload('payment.captured', {
    customer,
    amount: 24900,
    created_at: thirtyFiveDaysAgo,
  });
}

// ── Build basket-shrink scenario ───────────────────────────────────────────────
// Sends 3 high-value orders first, then a very small one to trigger shrink
async function buildBasketShrinkScenario() {
  const customer = CUSTOMERS[1]; // Priya Sharma
  // First 3 orders: high value (avg ~₹500)
  const highOrders = [49900, 54900, 47900].map(amount =>
    buildPaymentPayload('payment.captured', { customer, amount })
  );
  // 4th order: tiny value (₹79) — will drag avg down below 60% of peak
  const shrinkOrder = buildPaymentPayload('payment.captured', { customer, amount: 7900 });
  return [...highOrders, shrinkOrder];
}

// ── HTTP POST helper ───────────────────────────────────────────────────────────
function postWebhook(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    let signature = '';
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'your_webhook_secret_here') {
      signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    }

    const url = new URL(WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port:     url.port || 80,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'Content-Type':          'application/json',
        'Content-Length':        Buffer.byteLength(body),
        'X-Razorpay-Signature':  signature,
        'User-Agent':            'Razorpay-Webhook-Simulator/1.0',
      },
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (_) { resolve({ status: res.statusCode, body: data }); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Delay helper ───────────────────────────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Send a single event and log result ────────────────────────────────────────
async function sendEvent(payload, label = '') {
  const event     = payload.event;
  const payment   = payload.payload.payment.entity;
  const customer  = payment.notes?.name || payment.email;
  const amountRs  = (payment.amount / 100).toFixed(2);

  process.stdout.write(`  → [${event}] ${customer} ₹${amountRs} ${label}... `);

  try {
    const result = await postWebhook(payload);
    const icon   = result.status === 200 && result.body.success ? '✓' : '✗';
    console.log(`${icon} (HTTP ${result.status})`);
    if (result.body.error) console.log(`    Error: ${result.body.error}`);
    return result;
  } catch (err) {
    console.log(`✗ [Network error: ${err.message}]`);
    console.log('    Make sure backend server is running: cd backend && npm start');
    return null;
  }
}

// ── Main runner ────────────────────────────────────────────────────────────────
async function main() {
  const args     = process.argv.slice(2);
  const stream   = args.includes('--stream');
  const lapsed   = args.includes('--lapsed');
  const shrink   = args.includes('--shrink');

  console.log('');
  console.log('  Vyapar Pulse — Webhook Simulator');
  console.log('  Track 1: Autonomous Merchant Agent (Razorpay Buildathon)');
  console.log(`  Target: ${WEBHOOK_URL}`);
  console.log('  ──────────────────────────────────────────────────────');
  console.log('');

  if (lapsed) {
    console.log('  [Scenario] Lapsed customer — purchase 35 days ago');
    await sendEvent(buildLapsedScenario(), '[35 days ago]');
    console.log('  Done. Check /api/logs to see the agent win-back action.');
    return;
  }

  if (shrink) {
    console.log('  [Scenario] Basket shrink — 3 high-value orders then a tiny one');
    const events = await buildBasketShrinkScenario();
    for (const e of events) {
      await sendEvent(e);
      await delay(500);
    }
    console.log('  Done. Check /api/logs to see the agent upsell action.');
    return;
  }

  if (stream) {
    console.log('  [Stream mode] Sending events every 3 seconds. Ctrl+C to stop.\n');
    let i = 0;
    while (true) {
      const isFailure = Math.random() < 0.15;
      const event     = isFailure ? 'payment.failed' : 'payment.captured';
      await sendEvent(buildPaymentPayload(event));
      i++;
      if (i % 5 === 0) console.log(`  [${i} events sent]\n`);
      await delay(3000);
    }
  }

  // Default: send 15 realistic events with a mix of captured/failed
  console.log('  Sending 15 simulated payment events...\n');
  const events = [
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.failed'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.failed'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.failed'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
    buildPaymentPayload('payment.captured'),
  ];

  for (const e of events) {
    await sendEvent(e);
    await delay(200); // slight delay to avoid overwhelming the server
  }

  console.log('');
  console.log('  ✓ Done! Now check:');
  console.log('    GET http://localhost:5000/api/stats');
  console.log('    GET http://localhost:5000/api/logs');
  console.log('    GET http://localhost:5000/api/customers/flagged');
  console.log('');
}

main().catch(err => {
  console.error('Simulator error:', err.message);
  process.exit(1);
});
