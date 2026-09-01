// app.js — Express app configuration (separate from server startup for testability)
require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const webhookRoutes  = require('./routes/webhookRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler   = require('./middlewares/errorHandler');

const app = express();

// ── CORS — allow React dev server and production frontend ───────────────────
// FRONTEND_URL can be a comma-separated list:
//   e.g. "https://vyapar-pulse.vercel.app,https://vyapar-pulse.netlify.app"
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:3000',
  ...(process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow everything for easy local testing
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsing — capture raw body for webhook signature verification ──────
app.use((req, res, next) => {
  if (req.path === '/webhook') {
    express.raw({ type: 'application/json' })(req, res, (err) => {
      if (err) return next(err);
      req.rawBody = req.body;
      try { req.body = JSON.parse(req.body); } catch (_) {}
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Vyapar Pulse Backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/webhook',     webhookRoutes);
app.use('/api',         analyticsRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
