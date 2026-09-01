// models/Customer.js
// Tracks each unique customer: their purchase history, signals, and campaign caps
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customer_id:       { type: String, required: true, unique: true }, // phone or email
    name:              { type: String, default: 'Unknown' },
    email:             { type: String, default: '' },
    phone:             { type: String, default: '' },
    total_spent:       { type: Number, default: 0 },           // in paise, lifetime
    transaction_count: { type: Number, default: 0 },
    avg_basket:        { type: Number, default: 0 },           // running avg in paise
    last_purchase_at:  { type: Date, default: null },
    // Agent state
    signal:            { type: String, enum: ['none', 'lapsed', 'basket_shrink'], default: 'none' },
    last_campaign_at:  { type: Date, default: null },          // for hard cap: 1/customer/30 days
    campaign_count:    { type: Number, default: 0 },
    is_recovered:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── In-memory fallback ──────────────────────────────────────────────────────
let InMemoryCustomers = [];

class CustomerModel {
  static isMongoose() { return mongoose.connection.readyState === 1; }

  static async upsert(customer_id, data) {
    if (this.isMongoose()) {
      return Customer.findOneAndUpdate(
        { customer_id },
        { $set: data },
        { upsert: true, new: true, runValidators: true }
      );
    }
    const idx = InMemoryCustomers.findIndex(c => c.customer_id === customer_id);
    if (idx !== -1) {
      InMemoryCustomers[idx] = { ...InMemoryCustomers[idx], ...data, updatedAt: new Date() };
      return InMemoryCustomers[idx];
    }
    const doc = { _id: require('uuid').v4(), customer_id, ...data, createdAt: new Date(), updatedAt: new Date() };
    InMemoryCustomers.push(doc);
    return doc;
  }

  static async findById(customer_id) {
    if (this.isMongoose()) return Customer.findOne({ customer_id });
    return InMemoryCustomers.find(c => c.customer_id === customer_id) || null;
  }

  static async findAll(filter = {}) {
    if (this.isMongoose()) return Customer.find(filter).sort({ last_purchase_at: -1 });
    let results = [...InMemoryCustomers];
    if (filter.signal) results = results.filter(c => c.signal === filter.signal);
    return results;
  }

  static getStore() { return InMemoryCustomers; }
}

const Customer = mongoose.model('Customer', customerSchema);
module.exports = { Customer, CustomerModel };
