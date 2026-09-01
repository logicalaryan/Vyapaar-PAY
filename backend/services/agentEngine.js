// services/agentEngine.js
// The core AI rule engine:
//   Rule 1 — Lapsed Customer:   no purchase in >30 days → send win-back discount
//   Rule 2 — Basket Shrink:     avg basket < 60% of peak → send upsell bundle
// Hard cap: max 1 campaign per customer per 30 days (prevents spam)
//
// Edge case fixes applied:
//   [1] API timeout / failure — cap is SET BEFORE the message send attempt.
//       If the send fails, the cap still holds. Better to miss one send than double-send.
//   [2] Dual signal prevention — only ONE signal fires per event. Lapsed takes priority.
//       A second call that clears lapsed cannot then trigger basket_shrink in same run.
//   [3] Race condition (TOCTOU) — per-customer in-flight lock prevents two concurrent
//       events from both passing the cap check before either writes last_campaign_at.
//   [4] Zero/invalid amounts — avg_basket and discount amounts are validated before use.
//       If avg_basket is 0 or missing, basket shrink is suppressed (not enough data).

const { CustomerModel } = require('../models/Customer');
const { AgentLogModel }  = require('../models/AgentLog');
const { sendWinBackMessage, sendBasketUpsellMessage } = require('./messagingService');

// ── Constants ────────────────────────────────────────────────────────────────
const LAPSED_THRESHOLD_DAYS     = 30;    // days without purchase → lapsed
const BASKET_SHRINK_RATIO       = 0.60;  // avg must be < 60% of peak to trigger
const CAMPAIGN_CAP_DAYS         = 30;    // min days between campaigns for same customer
const WIN_BACK_DISCOUNT         = 15;    // % discount — always > 0, fixed constant
const BUNDLE_UPSELL_PRICE_PAISE = 39900; // ₹399 — always > any realistic avg_basket
const MIN_AVG_BASKET_FOR_SHRINK = 5000;  // ₹50 min — suppress shrink if data is too thin

// ── Fix [3]: Per-customer in-flight lock ─────────────────────────────────────
// Prevents two concurrent processPaymentEvent() calls for the SAME customer
// from both passing isCapBlocked() before either writes last_campaign_at.
// This is a lightweight in-process lock — sufficient for single-instance server.
// For multi-instance deployments, replace with a Redis SETNX lock.
const _inFlight = new Set();

function _acquireLock(customer_id) {
  if (_inFlight.has(customer_id)) return false;
  _inFlight.add(customer_id);
  return true;
}

function _releaseLock(customer_id) {
  _inFlight.delete(customer_id);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function daysSince(date) {
  if (!date) return Infinity;
  const d = new Date(date);
  if (isNaN(d.getTime())) return Infinity;
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
}

function isCapBlocked(customer) {
  if (!customer.last_campaign_at) return false;
  return daysSince(customer.last_campaign_at) < CAMPAIGN_CAP_DAYS;
}

function generateDiscountCode(customer_id) {
  const safe = customer_id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'CUST';
  return `WIN${safe}${Math.floor(Math.random() * 900 + 100)}`;
}

// ── Fix [4]: Validate amounts before any calculation ─────────────────────────
function safeAmount(val, fallback = 0) {
  const n = Number(val);
  return (isFinite(n) && n > 0) ? n : fallback;
}

// ── Main: process a single payment event ─────────────────────────────────────
async function processPaymentEvent(payment) {
  const customer_id   = payment.email || payment.contact || 'unknown';
  const customer_name = payment.notes?.name || payment.description || 'Customer';
  const amount        = safeAmount(payment.amount);

  // ── 1. Upsert customer record ─────────────────────────────────────────────
  let customer = await CustomerModel.findById(customer_id);

  if (!customer) {
    customer = await CustomerModel.upsert(customer_id, {
      customer_id,
      name:             customer_name,
      email:            payment.email   || '',
      phone:            payment.contact || '',
      total_spent:      0,
      transaction_count: 0,
      avg_basket:       0,
      last_purchase_at: null,
      signal:           'none',
    });
  }

  if (payment.status === 'captured' && amount > 0) {
    const prevCount = safeAmount(customer.transaction_count, 0);
    const prevTotal = safeAmount(customer.total_spent,       0);
    const newCount  = prevCount + 1;
    const newTotal  = prevTotal + amount;
    const newAvg    = Math.round(newTotal / newCount);

    // Fix [4]: Track peak basket so basket-shrink detection has valid reference
    const prevPeak  = safeAmount(customer._peak_basket || customer.avg_basket, 0);
    const newPeak   = Math.max(prevPeak, newAvg);

    customer = await CustomerModel.upsert(customer_id, {
      total_spent:       newTotal,
      transaction_count: newCount,
      avg_basket:        newAvg,
      _peak_basket:      newPeak,
      last_purchase_at:  new Date(payment.created_at ? payment.created_at * 1000 : Date.now()),
      is_recovered:      false,
    });
  }

  // Re-fetch to get the latest persisted state
  customer = await CustomerModel.findById(customer_id) || customer;

  // ── 2. Run detection rules (with per-customer lock) ──────────────────────
  // Fix [3]: Skip if this customer is already being processed by a concurrent event
  if (!_acquireLock(customer_id)) {
    console.warn(`[Agent] Skipping duplicate concurrent call for customer: ${customer_id}`);
    await AgentLogModel.create({
      event_type:    'cap_blocked',
      customer_id:   customer.customer_id,
      customer_name: customer.name,
      signal:        'none',
      action_taken:  'none',
      why:           'Concurrent event detected for this customer. Skipping to prevent race condition.',
      status:        'blocked',
    });
    return;
  }

  try {
    await _detectAndAct(customer);
  } finally {
    _releaseLock(customer_id);
  }
}

// ── Detection: evaluate both rules, act on at most ONE ───────────────────────
async function _detectAndAct(customer) {
  // Cap check — read BEFORE anything else (lock already held at this point)
  if (isCapBlocked(customer)) {
    await AgentLogModel.create({
      event_type:    'cap_blocked',
      customer_id:   customer.customer_id,
      customer_name: customer.name,
      signal:        customer.signal !== 'none' ? customer.signal : 'none',
      action_taken:  'none',
      why: `Campaign cap active: last campaign was ${Math.round(daysSince(customer.last_campaign_at))} day(s) ago (cap: ${CAMPAIGN_CAP_DAYS} days). Skipping to prevent spam.`,
      status: 'blocked',
    });
    return;
  }

  // Fix [2]: Rule 1 (lapsed) is evaluated first and takes full priority.
  // If lapsed is true, Rule 2 is never evaluated — preventing dual-signal in one pass.
  const lapsed = customer.last_purchase_at && daysSince(customer.last_purchase_at) >= LAPSED_THRESHOLD_DAYS;

  // Fix [4]: Suppress basket-shrink if avg_basket is 0 or below minimum meaningful threshold.
  // This prevents the rule firing on a customer with only 1 tiny order and a corrupted avg.
  let basketShrink = false;
  if (!lapsed && safeAmount(customer.transaction_count, 0) >= 3) {
    const currentAvg = safeAmount(customer.avg_basket, 0);
    const peakAvg    = safeAmount(customer._peak_basket || customer.avg_basket, 0);

    if (currentAvg >= MIN_AVG_BASKET_FOR_SHRINK && peakAvg > 0) {
      basketShrink = currentAvg < peakAvg * BASKET_SHRINK_RATIO;
    }
  }

  if (!lapsed && !basketShrink) {
    const daysSinceLast = customer.last_purchase_at
      ? Math.round(daysSince(customer.last_purchase_at))
      : null;
    await AgentLogModel.create({
      event_type:    'detection',
      customer_id:   customer.customer_id,
      customer_name: customer.name,
      signal:        'none',
      action_taken:  'none',
      why: `No signal detected. ${customer.transaction_count || 0} purchase(s)${daysSinceLast !== null ? `, last ${daysSinceLast} day(s) ago` : ''}.`,
      status:        'success',
    });
    await CustomerModel.upsert(customer.customer_id, { signal: 'none' });
    return;
  }

  if (lapsed) {
    await _actLapsed(customer);
  } else if (basketShrink) {
    await _actBasketShrink(customer);
  }
}

// ── Action: Lapsed customer → win-back discount ───────────────────────────────
async function _actLapsed(customer) {
  const discountCode  = generateDiscountCode(customer.customer_id);
  const daysSinceLast = Math.round(daysSince(customer.last_purchase_at));

  // Log detection
  await AgentLogModel.create({
    event_type:    'detection',
    customer_id:   customer.customer_id,
    customer_name: customer.name,
    signal:        'lapsed',
    action_taken:  'none',
    why: `Customer has not purchased in ${daysSinceLast} day(s) (threshold: ${LAPSED_THRESHOLD_DAYS} days). Flagging as lapsed.`,
    status: 'success',
    meta:   { days_since_last: daysSinceLast },
  });

  // Fix [1]: CLAIM THE CAP BEFORE attempting to send the message.
  // If the send times out or fails, the cap is already set — preventing a retry storm.
  // We intentionally accept "cap consumed but no send" over "double send".
  await CustomerModel.upsert(customer.customer_id, {
    signal:           'lapsed',
    last_campaign_at: new Date(),
    campaign_count:   (safeAmount(customer.campaign_count, 0)) + 1,
  });

  let result;
  try {
    result = await sendWinBackMessage(
      { customer_id: customer.customer_id, name: customer.name, phone: customer.phone, email: customer.email },
      { discount_code: discountCode, discount_percent: WIN_BACK_DISCOUNT, payment_link: null }
    );
  } catch (err) {
    // Messaging threw — log as failed delivery, cap already consumed above
    result = { delivered: false, channel: 'whatsapp', error: err.message, simulated: true };
    console.error(`[Agent] sendWinBackMessage threw for ${customer.customer_id}:`, err.message);
  }

  await AgentLogModel.create({
    event_type:    'action',
    customer_id:   customer.customer_id,
    customer_name: customer.name,
    signal:        'lapsed',
    action_taken:  'sent_win_back_discount',
    why: `Sent ${WIN_BACK_DISCOUNT}% win-back discount (code: ${discountCode}) via ${result.channel || 'whatsapp'}. Cap consumed — will not retry for ${CAMPAIGN_CAP_DAYS} days.`,
    status:        result.delivered ? 'success' : 'failed',
    meta:          { discount_code: discountCode, delivered: result.delivered, error: result.error || null, simulated: result.simulated },
  });
}

// ── Action: Basket shrink → upsell bundle ────────────────────────────────────
async function _actBasketShrink(customer) {
  const currentAvg = safeAmount(customer.avg_basket, 0);
  const peakAvg    = safeAmount(customer._peak_basket || customer.avg_basket, 0);

  await AgentLogModel.create({
    event_type:    'detection',
    customer_id:   customer.customer_id,
    customer_name: customer.name,
    signal:        'basket_shrink',
    action_taken:  'none',
    why: `Average basket ₹${(currentAvg / 100).toFixed(0)} vs peak ₹${(peakAvg / 100).toFixed(0)} — below ${BASKET_SHRINK_RATIO * 100}% threshold. Triggering upsell.`,
    status: 'success',
    meta:   { current_avg: currentAvg, peak_avg: peakAvg },
  });

  // Fix [1]: Claim cap BEFORE sending — same rationale as _actLapsed
  await CustomerModel.upsert(customer.customer_id, {
    signal:           'basket_shrink',
    last_campaign_at: new Date(),
    campaign_count:   (safeAmount(customer.campaign_count, 0)) + 1,
  });

  let result;
  try {
    result = await sendBasketUpsellMessage(
      { customer_id: customer.customer_id, name: customer.name, phone: customer.phone, email: customer.email },
      { bundle_name: 'Vyapar Value Bundle', bundle_price: BUNDLE_UPSELL_PRICE_PAISE, original_avg: currentAvg }
    );
  } catch (err) {
    result = { delivered: false, channel: 'whatsapp', error: err.message, simulated: true };
    console.error(`[Agent] sendBasketUpsellMessage threw for ${customer.customer_id}:`, err.message);
  }

  await AgentLogModel.create({
    event_type:    'action',
    customer_id:   customer.customer_id,
    customer_name: customer.name,
    signal:        'basket_shrink',
    action_taken:  'sent_upsell_bundle',
    why: `Offered Vyapar Value Bundle (₹${BUNDLE_UPSELL_PRICE_PAISE / 100}) to customer whose basket shrank. Cap consumed — will not retry for ${CAMPAIGN_CAP_DAYS} days.`,
    status:        result.delivered ? 'success' : 'failed',
    meta:          { delivered: result.delivered, error: result.error || null, simulated: result.simulated },
  });
}

// ── Analytics: agent performance summary ─────────────────────────────────────
async function getAgentStats() {
  const logs = await AgentLogModel.findAll(500);
  const actions    = logs.filter(l => l.event_type === 'action');
  const successful = actions.filter(l => l.status === 'success');
  return {
    total_actions:     actions.length,
    win_back_sent:     successful.filter(l => l.action_taken === 'sent_win_back_discount').length,
    upsell_sent:       successful.filter(l => l.action_taken === 'sent_upsell_bundle').length,
    cap_blocks:        logs.filter(l => l.event_type === 'cap_blocked').length,
    delivery_failures: actions.filter(l => l.status === 'failed').length,
  };
}

module.exports = { processPaymentEvent, getAgentStats };
