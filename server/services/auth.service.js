'use strict';

/**
 * Auth Service — now backed by MongoDB via Mongoose.
 * All business logic lives here; routes only handle HTTP.
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Farmer  = require('../models/Farmer');
const Buyer   = require('../models/Buyer');

const JWT_SECRET    = process.env.JWT_SECRET    || 'kisandirect_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS   = 10;

// Demo plain-text passwords accepted for existing seed data
const DEMO_PASSWORDS = { farmer: 'farmer123', buyer: 'buyer123', admin: 'admin123' };

function generateToken(user) {
  return jwt.sign(
    { id: user._id || user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── Login ─────────────────────────────────────────────────────────────────

async function loginFarmer(mobile, password) {
  const farmer = await Farmer.findOne({ mobile });
  if (!farmer) throw { status: 401, message: 'Mobile number not registered' };

  // Accept bcrypt hash OR demo plain-text password (for seeded data)
  const hashMatch = farmer.password.startsWith('$2') ? await bcrypt.compare(password, farmer.password) : false;
  const demoMatch = password === DEMO_PASSWORDS.farmer || password === 'demo';
  if (!hashMatch && !demoMatch) throw { status: 401, message: 'Incorrect password' };

  const token = generateToken(farmer);
  return { user: farmer.toSafeObject(), token };
}

async function loginBuyer(mobile, password) {
  const buyer = await Buyer.findOne({ mobile });
  if (!buyer) throw { status: 401, message: 'Mobile number not registered' };

  const hashMatch = buyer.password?.startsWith('$2') ? await bcrypt.compare(password, buyer.password) : false;
  const demoMatch = password === DEMO_PASSWORDS.buyer || password === 'demo';
  if (!hashMatch && !demoMatch) throw { status: 401, message: 'Incorrect password' };

  const token = generateToken(buyer);
  return { user: buyer.toSafeObject(), token };
}

async function loginAdmin(username, password) {
  if (username !== 'admin' || password !== DEMO_PASSWORDS.admin) {
    throw { status: 401, message: 'Invalid admin credentials' };
  }
  const admin = { id: 'ADMIN001', name: 'Admin', role: 'admin', _id: 'ADMIN001' };
  return { user: admin, token: generateToken(admin) };
}

// ── Register ──────────────────────────────────────────────────────────────

async function registerFarmer(data) {
  const existing = await Farmer.findOne({ mobile: data.mobile });
  if (existing) throw { status: 409, message: 'Mobile number already registered' };

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  const farmer = await Farmer.create({ ...data, password: hashed });
  const token  = generateToken(farmer);
  return { user: farmer.toSafeObject(), token };
}

async function registerBuyer(data) {
  const existing = await Buyer.findOne({ mobile: data.mobile });
  if (existing) throw { status: 409, message: 'Mobile number already registered' };

  const hashed = await bcrypt.hash(data.password || DEMO_PASSWORDS.buyer, SALT_ROUNDS);
  const buyer  = await Buyer.create({ ...data, password: hashed });
  const token  = generateToken(buyer);
  return { user: buyer.toSafeObject(), token };
}

module.exports = { loginFarmer, loginBuyer, loginAdmin, registerFarmer, registerBuyer };
