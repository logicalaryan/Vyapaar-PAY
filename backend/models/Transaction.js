// models/Transaction.js
// Represents a single Razorpay payment event (captured or failed)
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    razorpay_payment_id: { type: String, required: true, unique: true },
    razorpay_order_id:   { type: String, default: null },
    customer_id:         { type: String, required: true },   // phone or email
    customer_name:       { type: String, default: 'Unknown' },
    customer_email:      { type: String, default: '' },
    customer_phone:      { type: String, default: '' },
    amount:              { type: Number, required: true },    // in paise
    currency:            { type: String, default: 'INR' },
    status:              { type: String, enum: ['captured', 'failed', 'refunded'], required: true },
    method:              { type: String, default: 'upi' },    // upi, card, netbanking, etc.
    description:         { type: String, default: '' },
    notes:               { type: mongoose.Schema.Types.Mixed, default: {} },
    captured_at:         { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Use in-memory fallback when Mongoose is not connected
let InMemoryTransactions = [];

class TransactionModel {
  static isMongoose() {
    return mongoose.connection.readyState === 1;
  }

  static async create(data) {
    if (this.isMongoose()) {
      return Transaction.create(data);
    }
    const doc = { _id: require('uuid').v4(), ...data, createdAt: new Date(), updatedAt: new Date() };
    InMemoryTransactions.push(doc);
    return doc;
  }

  static async findAll(filter = {}) {
    if (this.isMongoose()) {
      return Transaction.find(filter).sort({ captured_at: -1 });
    }
    let results = [...InMemoryTransactions];
    if (filter.customer_id) results = results.filter(t => t.customer_id === filter.customer_id);
    if (filter.status) results = results.filter(t => t.status === filter.status);
    return results.sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));
  }

  static async findById(id) {
    if (this.isMongoose()) return Transaction.findById(id);
    return InMemoryTransactions.find(t => t._id === id || t.razorpay_payment_id === id) || null;
  }

  static getStore() { return InMemoryTransactions; }
}

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = { Transaction, TransactionModel };
