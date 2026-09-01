// models/Campaign.js — Placeholder for V2 (multi-campaign logic excluded from V1)
// V1 only supports one active campaign type per customer at a time (via AgentLog + Customer.signal)
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    campaign_type:  { type: String, enum: ['win_back', 'upsell_bundle'], required: true },
    customer_id:    { type: String, required: true },
    discount_code:  { type: String, default: null },
    status:         { type: String, enum: ['active', 'redeemed', 'expired'], default: 'active' },
    sent_at:        { type: Date, default: Date.now },
    redeemed_at:    { type: Date, default: null },
  },
  { timestamps: true }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = { Campaign };
