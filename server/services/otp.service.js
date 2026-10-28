'use strict';

/**
 * OTP Service — in-memory store
 * ─────────────────────────────
 * Stores OTPs keyed by email. Each entry:
 *   { otp, expiresAt, attempts, verified }
 *
 * Rules enforced:
 *  • OTP expires after OTP_TTL_MS (10 minutes)
 *  • Max OTP_MAX_ATTEMPTS wrong guesses before the OTP is invalidated
 *  • Once verified, the token cannot be reused (single-use)
 *  • Resend is rate-limited to once per OTP_RESEND_COOLDOWN_MS (60 s)
 *
 * Replace this Map with a Redis/DB store when moving to production.
 */

const emailService = require('./email.service');

const OTP_TTL_MS           = 10 * 60 * 1000;   // 10 minutes
const OTP_MAX_ATTEMPTS     = 5;                  // max wrong guesses
const OTP_RESEND_COOLDOWN  = 60 * 1000;          // 60 seconds between resends
const OTP_LENGTH           = 6;

/** @type {Map<string, {otp:string, expiresAt:number, sentAt:number, attempts:number, verified:boolean}>} */
const store = new Map();

function generateNumericOTP(length) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

/**
 * Generate an OTP, persist it, and send via email.
 * Returns { success, message, resendAvailableAt? }
 */
async function sendOTP(email, name) {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw { status: 400, message: 'Valid email address is required' };
  }

  const now = Date.now();
  const existing = store.get(email);

  // Rate-limit resends
  if (existing && now - existing.sentAt < OTP_RESEND_COOLDOWN) {
    const waitSec = Math.ceil((OTP_RESEND_COOLDOWN - (now - existing.sentAt)) / 1000);
    throw { status: 429, message: `Please wait ${waitSec} seconds before requesting a new OTP` };
  }

  const otp = generateNumericOTP(OTP_LENGTH);

  store.set(email, {
    otp,
    expiresAt: now + OTP_TTL_MS,
    sentAt: now,
    attempts: 0,
    verified: false,
  });

  // Send via email service — throws on hard failure
  const result = await emailService.sendOTP({ to: email, name, otp });

  return {
    success: true,
    message: 'OTP sent to your email address',
    emailDeliveredTo: result.deliveredTo,
    intendedFor: result.intendedFor,
    domainVerified: result.domainVerified,
    expiresInMinutes: OTP_TTL_MS / 60000,
  };
}

/**
 * Verify an OTP submitted by the user.
 * Returns { success, message }
 * Throws with { status, message } on failure.
 */
function verifyOTP(email, submittedOtp) {
  if (!email || !submittedOtp) {
    throw { status: 400, message: 'Email and OTP are required' };
  }

  const entry = store.get(email);

  if (!entry) {
    throw { status: 400, message: 'No OTP found for this email. Please request a new one.' };
  }

  if (entry.verified) {
    throw { status: 400, message: 'This OTP has already been used. Please request a new one.' };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    throw { status: 400, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.attempts >= OTP_MAX_ATTEMPTS) {
    store.delete(email);
    throw { status: 400, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (submittedOtp.toString().trim() !== entry.otp) {
    entry.attempts += 1;
    const remaining = OTP_MAX_ATTEMPTS - entry.attempts;
    throw {
      status: 400,
      message: remaining > 0
        ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  // ✓ Correct — mark as used (single-use enforcement)
  entry.verified = true;

  return { success: true, message: 'Email verified successfully' };
}

/**
 * Check whether an email has been verified (without consuming the token again).
 * Used by auth controller to gate email_verified flag.
 */
function isVerified(email) {
  const entry = store.get(email);
  return !!(entry && entry.verified);
}

/** Clean up expired entries — call periodically */
function purgeExpired() {
  const now = Date.now();
  for (const [email, entry] of store.entries()) {
    if (now > entry.expiresAt + OTP_TTL_MS) { // extra TTL buffer before purge
      store.delete(email);
    }
  }
}

// Purge expired entries every 15 minutes
setInterval(purgeExpired, 15 * 60 * 1000).unref();

module.exports = { sendOTP, verifyOTP, isVerified };
