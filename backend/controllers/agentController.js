// controllers/agentController.js — manual trigger endpoints for demo
const { processPaymentEvent, getAgentStats } = require('../services/agentEngine');

// POST /api/agent/trigger — manually trigger agent run on a customer (demo use)
async function triggerAgent(req, res) {
  try {
    const payment = req.body;
    await processPaymentEvent(payment);
    res.json({ success: true, message: 'Agent triggered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getStats(req, res) {
  try {
    const stats = await getAgentStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { triggerAgent, getStats };
