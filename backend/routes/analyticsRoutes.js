// routes/analyticsRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getStats,
  getRevenueTrend,
  getFlaggedCustomers,
  getAgentLogs,
  getTransactions,
} = require('../controllers/analyticsController');

router.get('/stats',             getStats);
router.get('/revenue',           getRevenueTrend);
router.get('/customers/flagged', getFlaggedCustomers);
router.get('/logs',              getAgentLogs);
router.get('/transactions',      getTransactions);

module.exports = router;
