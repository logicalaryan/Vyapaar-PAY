// models/AgentLog.js
// Audit log — every detection and action the agent takes is recorded here
const mongoose = require('mongoose');

const agentLogSchema = new mongoose.Schema(
  {
    event_type:   {
      type: String,
      enum: ['detection', 'action', 'delivery', 'cap_blocked', 'error'],
      required: true,
    },
    customer_id:  { type: String, required: true },
    customer_name:{ type: String, default: 'Unknown' },
    signal:       { type: String, enum: ['lapsed', 'basket_shrink', 'none'], default: 'none' },
    action_taken: { type: String, default: '' },   // e.g. "sent_win_back_discount"
    why:          { type: String, default: '' },   // plain-language explanation for judges
    status:       { type: String, enum: ['success', 'failed', 'blocked', 'simulated'], default: 'success' },
    meta:         { type: mongoose.Schema.Types.Mixed, default: {} },
    triggered_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── In-memory fallback ──────────────────────────────────────────────────────
let InMemoryLogs = [];

class AgentLogModel {
  static isMongoose() { return mongoose.connection.readyState === 1; }

  static async create(data) {
    if (this.isMongoose()) return AgentLog.create(data);
    const doc = { _id: require('uuid').v4(), ...data, createdAt: new Date(), updatedAt: new Date() };
    InMemoryLogs.push(doc);
    return doc;
  }

  static async findAll(limit = 100) {
    if (this.isMongoose()) return AgentLog.find().sort({ triggered_at: -1 }).limit(limit);
    return [...InMemoryLogs].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at)).slice(0, limit);
  }

  static getStore() { return InMemoryLogs; }
}

const AgentLog = mongoose.model('AgentLog', agentLogSchema);
module.exports = { AgentLog, AgentLogModel };
