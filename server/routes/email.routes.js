/**
 * Email Routes  —  /api/email/*
 *
 * POST /api/email/test            send a test email to verify integration
 * POST /api/email/welcome-farmer  welcome a newly registered farmer
 * POST /api/email/welcome-buyer   welcome a newly registered buyer
 * POST /api/email/buyer-request   alert farmer of a new buyer request
 * POST /api/email/order-update    alert farmer of an order status change
 * POST /api/email/price-alert     alert farmer when target price is reached
 * POST /api/email/otp             send OTP for verification
 */

const express      = require('express');
const router       = express.Router();
const emailService = require('../services/email.service');

// Wraps async handlers — errors never crash the server
const wrap = fn => (req, res) =>
  fn(req, res).catch(err => {
    console.error('[EmailRoute]', err.message);
    res.status(500).json({ success: false, message: err.message });
  });

// ── Test ──────────────────────────────────────────────────────────────────
router.post('/test', wrap(async (req, res) => {
  const to = req.body.to || process.env.EMAIL_REPLY_TO;
  if (!to) return res.status(400).json({ success: false, message: 'Provide a "to" email address' });
  const result = await emailService.sendTestEmail({ to });
  res.json({ success: true, message: `Test email sent to ${to}`, result });
}));

// ── Welcome: Farmer ───────────────────────────────────────────────────────
router.post('/welcome-farmer', wrap(async (req, res) => {
  const { to, name, village, district, mainCrop } = req.body;
  if (!to || !name) return res.status(400).json({ success: false, message: 'to and name are required' });
  const result = await emailService.sendFarmerWelcome({ to, name, village, district, mainCrop });
  res.json({ success: true, message: 'Welcome email sent', result });
}));

// ── Welcome: Buyer ────────────────────────────────────────────────────────
router.post('/welcome-buyer', wrap(async (req, res) => {
  const { to, name, companyName, businessType } = req.body;
  if (!to || !name) return res.status(400).json({ success: false, message: 'to and name are required' });
  const result = await emailService.sendBuyerWelcome({ to, name, companyName, businessType });
  res.json({ success: true, message: 'Welcome email sent', result });
}));

// ── Buyer Request Notification → Farmer ──────────────────────────────────
router.post('/buyer-request', wrap(async (req, res) => {
  const { to, farmerName, buyerName, crop, quantity, unit, offeredPrice, deliveryDate } = req.body;
  if (!to) return res.status(400).json({ success: false, message: 'to is required' });
  const result = await emailService.sendBuyerRequestNotification({ to, farmerName, buyerName, crop, quantity, unit, offeredPrice, deliveryDate });
  res.json({ success: true, message: 'Notification sent', result });
}));

// ── Order Status Update → Farmer ─────────────────────────────────────────
router.post('/order-update', wrap(async (req, res) => {
  const { to, farmerName, orderId, status, buyerName, crop, quantity, totalValue } = req.body;
  if (!to || !orderId) return res.status(400).json({ success: false, message: 'to and orderId are required' });
  const result = await emailService.sendOrderStatusUpdate({ to, farmerName, orderId, status, buyerName, crop, quantity, totalValue });
  res.json({ success: true, message: 'Order update email sent', result });
}));

// ── Price Alert → Farmer ──────────────────────────────────────────────────
router.post('/price-alert', wrap(async (req, res) => {
  const { to, farmerName, crop, targetPrice, market, currentPrice } = req.body;
  if (!to) return res.status(400).json({ success: false, message: 'to is required' });
  const result = await emailService.sendPriceAlertTriggered({ to, farmerName, crop, targetPrice, market, currentPrice });
  res.json({ success: true, message: 'Price alert email sent', result });
}));

// ── OTP ───────────────────────────────────────────────────────────────────
router.post('/otp', wrap(async (req, res) => {
  const { to, name, otp } = req.body;
  if (!to || !otp) return res.status(400).json({ success: false, message: 'to and otp are required' });
  const result = await emailService.sendOTP({ to, name, otp });
  res.json({ success: true, message: 'OTP sent', result });
}));

module.exports = router;
