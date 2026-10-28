'use strict';

const express  = require('express');
const cors     = require('cors');
require('dotenv').config();

const connectDB          = require('./config/db');
const { ensureDB }       = require('./config/db');
const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto-reconnect to MongoDB before any API route that needs the DB
app.use('/api', ensureDB);

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/crops',         require('./routes/crop.routes'));
app.use('/api/market-prices', require('./routes/marketPrice.routes'));
app.use('/api/buyers',        require('./routes/buyer.routes'));
app.use('/api/requests',      require('./routes/request.routes'));
app.use('/api/orders',        require('./routes/order.routes'));
app.use('/api/transport',     require('./routes/transport.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/earnings',      require('./routes/earnings.routes'));
app.use('/api/admin',         require('./routes/admin.routes'));
app.use('/api/reports',       require('./routes/report.routes'));
app.use('/api/alerts',        require('./routes/alert.routes'));
app.use('/api/mandi-prices',  require('./routes/mandiPrice.routes'));
app.use('/api/email',         require('./routes/email.routes'));
app.use('/api/otp',           require('./routes/otp.routes'));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'OK',
    message: 'KisanDirect API is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start — connect DB first, then listen ────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ KisanDirect server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;

