'use strict';

/**
 * OTP Routes  —  /api/otp
 *
 * POST /api/otp/send
 *   Body: { email, name? }
 *   Generates a 6-digit OTP, stores it server-side, and sends it via Resend.
 *   Returns: { success, message, expiresInMinutes, domainVerified, emailDeliveredTo, intendedFor }
 *
 * POST /api/otp/verify
 *   Body: { email, otp }
 *   Validates the OTP. Marks it as used on success (single-use).
 *   Returns: { success, message }
 *
 * IMPORTANT: Registration is NOT marked as email-verified just because an
 * email was sent. Verified status is only set after POST /api/otp/verify succeeds.
 */

const express    = require('express');
const router     = express.Router();
const otpService = require('../services/otp.service');

const wrap = fn => (req, res) =>
  fn(req, res).catch(err => {
    // Operational errors (4xx) vs unexpected (5xx)
    const status  = err.status || 500;
    const message = err.message || 'Internal server error';
    console.error(`[OTP] ${status} ${message}`);
    res.status(status).json({ success: false, message });
  });

// ── POST /api/otp/send ────────────────────────────────────────────────────
router.post('/send', wrap(async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'email is required' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address format' });
  }

  const result = await otpService.sendOTP(email.toLowerCase().trim(), name);

  // Inform the frontend clearly whether delivery went to the farmer's
  // actual inbox or was redirected (Resend free-tier restriction)
  res.json({
    success: true,
    message: result.message,
    expiresInMinutes: result.expiresInMinutes,
    delivery: {
      domainVerified:  result.domainVerified,
      intendedFor:     result.intendedFor,
      emailDeliveredTo: result.emailDeliveredTo,
      // Explicit flag so frontend can show the right message
      reachedFarmer: result.domainVerified,
    },
  });
}));

// ── POST /api/otp/verify ──────────────────────────────────────────────────
router.post('/verify', wrap(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'email and otp are required' });
  }

  const result = otpService.verifyOTP(email.toLowerCase().trim(), otp);

  res.json({ success: true, message: result.message });
}));

module.exports = router;
