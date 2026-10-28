'use strict';
const mongoose = require('mongoose');
const dns      = require('dns');

// Force Google DNS — fixes SRV record resolution on some networks
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

let isConnected   = false;
let isReconnecting = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in server/.env');

  mongoose.set('strictQuery', false);

  await mongoose.connect(uri, {
    // ── Connection timeouts ──────────────────────────────────────────────
    serverSelectionTimeoutMS: 30000,  // 30 s to pick a server
    socketTimeoutMS:          45000,  // 45 s idle socket timeout
    connectTimeoutMS:         20000,  // 20 s TCP connect timeout

    // ── Keep-alive — prevents Atlas from closing idle connections ────────
    heartbeatFrequencyMS:     10000,  // ping Atlas every 10 s
    minHeartbeatFrequencyMS:  500,

    // ── Auto-reconnect on drop ───────────────────────────────────────────
    maxPoolSize:              10,     // max simultaneous connections
    minPoolSize:              2,      // keep at least 2 alive
    maxIdleTimeMS:            60000,  // close pool conn after 60 s idle
    waitQueueTimeoutMS:       10000,  // wait up to 10 s for a pool slot

    family: 4,  // force IPv4 (avoids IPv6 SRV issues on Windows)
  });

  isConnected = true;
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

  // ── Reconnection logic ─────────────────────────────────────────────────
  mongoose.connection.on('connected', () => {
    isConnected    = true;
    isReconnecting = false;
    console.log('✅ MongoDB reconnected');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    if (!isReconnecting) {
      isReconnecting = true;
      console.warn('⚠️  MongoDB disconnected — will reconnect automatically');
    }
  });

  mongoose.connection.on('reconnected', () => {
    isConnected    = true;
    isReconnecting = false;
    console.log('✅ MongoDB reconnected after drop');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('❌ MongoDB error:', err.message);
  });

  mongoose.connection.on('close', () => {
    isConnected = false;
    console.warn('⚠️  MongoDB connection closed');
  });
}

/**
 * Middleware-style helper — ensures a live connection before each request.
 * Attach as: app.use(ensureDB)
 * Prevents "Topology is closed" errors on cold routes after idle periods.
 */
async function ensureDB(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB] Reconnect failed:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please retry.',
    });
  }
}

module.exports = connectDB;
module.exports.ensureDB = ensureDB;
