// server.js — Entry point: connects DB and starts Express server
require('dotenv').config();

const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  // Connect to MongoDB (gracefully falls back to in-memory if unavailable)
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════╗');
    console.log('  ║   Vyapar Pulse Backend — Phase 1         ║');
    console.log(`  ║   Listening on http://localhost:${PORT}     ║`);
    console.log('  ║   POST /webhook   — receive events       ║');
    console.log('  ║   GET  /api/stats — dashboard data       ║');
    console.log('  ║   GET  /health    — health check         ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log('');
    console.log('  [Tip] No ngrok needed — run: node simulateWebhook.js');
    console.log('');
  });
}

start().catch(err => {
  console.error('[Startup] Fatal error:', err.message);
  process.exit(1);
});
