// controllers/analyticsController.js
// Read-only endpoints — used by the React frontend dashboard
//
// Guards applied:
//   1. Empty DB  — all endpoints return safe zero-state defaults, never crash
//   2. DB errors — caught, logged server-side, clean 503 returned to client
//   3. Pagination — all list endpoints enforce a hard MAX_LIMIT cap
//   4. Data masking — phone numbers masked, emails partially masked before response

const { TransactionModel } = require('../models/Transaction');
const { CustomerModel }    = require('../models/Customer');
const { AgentLogModel }    = require('../models/AgentLog');
const { getAgentStats }    = require('../services/agentEngine');

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_LOGS         = 200;   // hard cap on /api/logs
const MAX_TRANSACTIONS = 500;   // hard cap on /api/transactions
const MAX_DAYS         = 90;    // hard cap on ?days= param

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Mask phone: +919876543210 → +91*****3210 */
function maskPhone(phone) {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, 3) + '*'.repeat(Math.max(0, phone.length - 7)) + phone.slice(-4);
}

/** Mask email: ravi.kumar@gmail.com → ra***@gmail.com */
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

/** Safe date parse — returns null instead of Invalid Date */
function safeDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/** Safe ISO date string for bucketing — falls back to null */
function safeDateKey(val) {
  const d = safeDate(val);
  return d ? d.toISOString().split('T')[0] : null;
}

/** Clamp an integer to [min, max] */
function clamp(val, min, max) {
  const n = parseInt(val);
  if (isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

// ── GET /api/stats ─────────────────────────────────────────────────────────────
// Returns summary stat cards. Safe empty-state: all zeros.
async function getStats(req, res) {
  try {
    const [transactions, customers, agentStats] = await Promise.all([
      TransactionModel.findAll({ status: 'captured' }),
      CustomerModel.findAll(),
      getAgentStats(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTxns = transactions.filter(t => {
      const d = safeDate(t.captured_at || t.createdAt);
      return d && d >= today;
    });

    const revenueToday      = todayTxns.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalTransactions = transactions.length;

    const activeCustomers = customers.filter(c => {
      const d = safeDate(c.last_purchase_at);
      if (!d) return false;
      return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    }).length;

    const totalRevenue = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const revenueRecovered = (agentStats.win_back_sent || 0) * avgOrderValue;

    res.json({
      success: true,
      data: {
        revenue_today:      revenueToday,
        transactions_today: todayTxns.length,
        total_transactions: totalTransactions,
        active_customers:   activeCustomers,
        total_customers:    customers.length,
        revenue_recovered:  Math.round(revenueRecovered),
        total_actions:      agentStats.total_actions      || 0,
        win_back_sent:      agentStats.win_back_sent      || 0,
        upsell_sent:        agentStats.upsell_sent        || 0,
        cap_blocks:         agentStats.cap_blocks         || 0,
        delivery_failures:  agentStats.delivery_failures  || 0,
      },
    });
  } catch (err) {
    console.error('[GET /api/stats] Error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Stats unavailable — please try again',
      // Return zero-state so the frontend dashboard doesn't crash
      data: {
        revenue_today: 0, transactions_today: 0, total_transactions: 0,
        active_customers: 0, total_customers: 0, revenue_recovered: 0,
        total_actions: 0, win_back_sent: 0, upsell_sent: 0,
        cap_blocks: 0, delivery_failures: 0,
      },
    });
  }
}

// ── GET /api/revenue?days=7 ────────────────────────────────────────────────────
// Returns per-day revenue buckets. Safe empty-state: all-zero buckets still returned.
async function getRevenueTrend(req, res) {
  try {
    // Clamp days: 1–90, default 7
    const days = clamp(req.query.days, 1, MAX_DAYS) || 7;

    const [transactions, logs] = await Promise.all([
      TransactionModel.findAll({ status: 'captured' }),
      AgentLogModel.findAll(MAX_LOGS),
    ]);

    // Build per-day buckets — always returned even if empty
    const buckets = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split('T')[0];
      buckets[key] = {
        date:              key,
        total_revenue:     0,
        organic_revenue:   0,
        ai_recovered:      0,
        transaction_count: 0,
        win_back_orders:   0,
      };
    }

    // Fill organic revenue
    transactions.forEach(t => {
      const key = safeDateKey(t.captured_at || t.createdAt);
      if (key && buckets[key]) {
        buckets[key].total_revenue    += Number(t.amount) || 0;
        buckets[key].organic_revenue  += Number(t.amount) || 0;
        buckets[key].transaction_count += 1;
      }
    });

    // Fill AI-recovered revenue (subtract from organic so bars don't double-count)
    const totalRevenue = transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const avgOrder = transactions.length > 0 ? totalRevenue / transactions.length : 0;

    logs
      .filter(l => l.event_type === 'action' && l.action_taken === 'sent_win_back_discount' && l.status === 'success')
      .forEach(l => {
        const key = safeDateKey(l.triggered_at || l.createdAt);
        if (key && buckets[key]) {
          const recovered = Math.round(avgOrder);
          buckets[key].win_back_orders  += 1;
          buckets[key].ai_recovered     += recovered;
          buckets[key].organic_revenue  = Math.max(0, buckets[key].organic_revenue - recovered);
        }
      });

    res.json({ success: true, days, data: Object.values(buckets) });
  } catch (err) {
    console.error('[GET /api/revenue] Error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Revenue data unavailable — please try again',
      data: [],
    });
  }
}

// ── GET /api/customers/flagged ─────────────────────────────────────────────────
// Returns flagged customers. Phone/email are MASKED before sending to client.
async function getFlaggedCustomers(req, res) {
  try {
    const page     = clamp(req.query.page, 1, 9999) || 1;
    const pageSize = clamp(req.query.limit, 1, 100) || 50;

    const customers = await CustomerModel.findAll();

    const flagged = customers
      .filter(c => c.signal && c.signal !== 'none')
      .map(c => {
        const lastPurchase = safeDate(c.last_purchase_at);
        return {
          customer_id:      c.customer_id,
          name:             c.name || 'Unknown',
          // ⚠️  MASKED — do not expose full contact info in a demo/deployed env
          email:            maskEmail(c.email),
          phone:            maskPhone(c.phone),
          signal:           c.signal,
          last_purchase_at: lastPurchase ? lastPurchase.toISOString() : null,
          days_lapsed:      lastPurchase
            ? Math.round((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
            : null,
          avg_basket:       Number(c.avg_basket)    || 0,
          campaign_count:   Number(c.campaign_count) || 0,
          last_campaign_at: safeDate(c.last_campaign_at)?.toISOString() || null,
          is_recovered:     Boolean(c.is_recovered),
        };
      });

    // Paginate
    const total   = flagged.length;
    const start   = (page - 1) * pageSize;
    const paged   = flagged.slice(start, start + pageSize);

    res.json({
      success:  true,
      total,
      page,
      page_size: pageSize,
      count:    paged.length,
      data:     paged,
    });
  } catch (err) {
    console.error('[GET /api/customers/flagged] Error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Customer data unavailable — please try again',
      data: [],
    });
  }
}

// ── GET /api/logs?limit=50&page=1 ─────────────────────────────────────────────
// Returns agent activity log. Hard-capped at MAX_LOGS per page.
async function getAgentLogs(req, res) {
  try {
    const page     = clamp(req.query.page, 1, 9999) || 1;
    const pageSize = clamp(req.query.limit, 1, MAX_LOGS) || 50;

    // Fetch with hard server-side cap — never returns unbounded data
    const allLogs = await AgentLogModel.findAll(MAX_LOGS);

    const total = allLogs.length;
    const start = (page - 1) * pageSize;
    const paged = allLogs.slice(start, start + pageSize);

    // Strip any internal meta fields that might contain raw contact data
    const sanitized = paged.map(l => ({
      _id:           l._id,
      event_type:    l.event_type,
      customer_id:   maskEmail(l.customer_id),   // customer_id is email
      customer_name: l.customer_name || 'Unknown',
      signal:        l.signal,
      action_taken:  l.action_taken,
      why:           l.why,
      status:        l.status,
      triggered_at:  safeDate(l.triggered_at || l.createdAt)?.toISOString() || null,
      // meta deliberately excluded — may contain raw phone/email from messaging service
    }));

    res.json({
      success:  true,
      total,
      page,
      page_size: pageSize,
      count:    sanitized.length,
      data:     sanitized,
    });
  } catch (err) {
    console.error('[GET /api/logs] Error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Log data unavailable — please try again',
      data: [],
    });
  }
}

// ── GET /api/transactions?limit=50&page=1 ─────────────────────────────────────
// Returns recent transactions. Hard-capped at MAX_TRANSACTIONS.
async function getTransactions(req, res) {
  try {
    const page     = clamp(req.query.page, 1, 9999) || 1;
    const pageSize = clamp(req.query.limit, 1, 100) || 50;

    const all = await TransactionModel.findAll();

    const total = all.length;
    const start = (page - 1) * pageSize;
    const paged = all.slice(start, start + pageSize);

    const sanitized = paged.map(t => ({
      _id:                 t._id,
      razorpay_payment_id: t.razorpay_payment_id,
      customer_name:       t.customer_name || 'Unknown',
      // Mask contact info
      customer_email:      maskEmail(t.customer_email),
      customer_phone:      maskPhone(t.customer_phone),
      amount:              Number(t.amount) || 0,
      currency:            t.currency || 'INR',
      status:              t.status,
      method:              t.method,
      captured_at:         safeDate(t.captured_at || t.createdAt)?.toISOString() || null,
    }));

    res.json({
      success:  true,
      total,
      page,
      page_size: pageSize,
      count:    sanitized.length,
      data:     sanitized,
    });
  } catch (err) {
    console.error('[GET /api/transactions] Error:', err.message);
    res.status(503).json({
      success: false,
      error: 'Transaction data unavailable — please try again',
      data: [],
    });
  }
}

module.exports = { getStats, getRevenueTrend, getFlaggedCustomers, getAgentLogs, getTransactions };
