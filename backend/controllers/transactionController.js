// controllers/transactionController.js — V1 stub
const { TransactionModel } = require('../models/Transaction');

async function getAllTransactions(req, res) {
  try {
    const txns = await TransactionModel.findAll();
    res.json({ success: true, count: txns.length, data: txns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllTransactions };
