// controllers/customerController.js — V1 stub (customers exposed via analyticsController)
// Full CRUD endpoints planned for V2
const { CustomerModel } = require('../models/Customer');

async function getAllCustomers(req, res) {
  try {
    const customers = await CustomerModel.findAll();
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllCustomers };
