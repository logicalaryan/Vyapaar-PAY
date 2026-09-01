// config/db.js — MongoDB connection (with in-memory fallback flag)
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // If no MONGO_URI set, skip DB connection and use in-memory store
  if (!uri || uri === '') {
    console.log('[DB] No MONGO_URI set — running with in-memory store');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    console.log('[DB] Falling back to in-memory store');
    return null;
  }
};

module.exports = connectDB;
