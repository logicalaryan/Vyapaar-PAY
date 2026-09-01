// utils/helpers.js — shared utility functions

/** Convert paise to rupees string */
function paiseToRupees(paise) {
  return (paise / 100).toFixed(2);
}

/** Days since a given date */
function daysSince(date) {
  if (!date) return Infinity;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
}

/** Generate a random alphanumeric ID */
function shortId(prefix = '', length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  for (let i = 0; i < length; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

module.exports = { paiseToRupees, daysSince, shortId };
