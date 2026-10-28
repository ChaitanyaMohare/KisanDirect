'use strict';
/**
 * KisanDirect — MongoDB Seed Script
 * Run once to populate Atlas with demo data:
 *   node scripts/seed.js
 *
 * Safe to re-run — uses upsert so no duplicates are created.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dns      = require('dns');

// Force Google DNS for SRV record resolution
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const Farmer      = require('../models/Farmer');
const Buyer       = require('../models/Buyer');
const CropListing = require('../models/CropListing');
const Order       = require('../models/Order');
const BuyerRequest= require('../models/BuyerRequest');
const PriceAlert  = require('../models/PriceAlert');

const mockFarmers  = require('../data/farmers');
const mockBuyers   = require('../data/buyers');
const mockCrops    = require('../data/crops');
const mockOrders   = require('../data/orders');
const mockRequests = require('../data/requests');

const DEMO_PW = 'farmer123';

async function seed() {
  console.log('\n🌱 KisanDirect — Seeding MongoDB Atlas...\n');

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    family: 4,
  });
  console.log(`✅ Connected: ${mongoose.connection.host}\n`);

  const hashedFarmer = await bcrypt.hash(DEMO_PW, 10);
  const hashedBuyer  = await bcrypt.hash('buyer123', 10);

  // ── Farmers ──────────────────────────────────────────────────────────────
  console.log('👨‍🌾 Seeding farmers...');
  const farmerIdMap = {};  // old string id → new ObjectId

  for (const f of mockFarmers) {
    const doc = await Farmer.findOneAndUpdate(
      { mobile: f.mobile },
      {
        name: f.name, mobile: f.mobile, email: f.email || null,
        password: hashedFarmer, village: f.village, district: f.district,
        state: f.state, pincode: f.pincode || '', preferredLanguage: f.preferredLanguage || 'hi',
        mainCrop: f.mainCrop, landHolding: f.landHolding || '',
        role: 'farmer', isVerified: f.isVerified, mobileVerified: f.mobileVerified,
        farmerVerified: f.farmerVerified, locationVerified: f.locationVerified,
        totalEarnings: f.totalEarnings || 0, activeListings: f.activeListings || 0,
      },
      { upsert: true, new: true }
    );
    farmerIdMap[f.id] = doc._id;
    console.log(`  ✓ ${f.name} (${f.mobile})`);
  }

  // ── Buyers ───────────────────────────────────────────────────────────────
  console.log('\n🏭 Seeding buyers...');
  const buyerIdMap = {};

  for (const b of mockBuyers) {
    const doc = await Buyer.findOneAndUpdate(
      { mobile: b.mobile },
      {
        name: b.name, companyName: b.companyName, mobile: b.mobile,
        email: b.email || null, password: hashedBuyer,
        businessType: b.businessType, location: b.location,
        district: b.district, state: b.state, role: 'buyer',
        isVerified: b.isVerified, businessVerified: b.businessVerified,
        mobileVerified: b.mobileVerified, gstVerified: b.gstVerified,
        gstNumber: b.gstNumber || null, preferredCrops: b.preferredCrops || [],
        rating: b.rating || 0, totalPurchases: b.totalPurchases || 0,
      },
      { upsert: true, new: true }
    );
    buyerIdMap[b.id] = doc._id;
    console.log(`  ✓ ${b.name} — ${b.companyName}`);
  }

  // ── Crop Listings ─────────────────────────────────────────────────────────
  console.log('\n🌾 Seeding crop listings...');

  // Clear old listings to avoid duplicates on re-seed
  await CropListing.deleteMany({});

  for (const c of mockCrops) {
    const fId = farmerIdMap[c.farmerId];
    if (!fId) { console.log(`  ⚠  Skipping crop ${c.id} — farmer ${c.farmerId} not found`); continue; }
    await CropListing.create({
      farmerId: fId, farmerName: c.farmerName, farmerLocation: c.farmerLocation,
      crop: c.crop, variety: c.variety, quantity: c.quantity, unit: c.unit,
      expectedPrice: c.expectedPrice, harvestDate: c.harvestDate, quality: c.quality,
      location: c.location, district: c.district, state: c.state,
      description: c.description, availableFrom: c.availableFrom,
      status: c.status, views: c.views || 0, interestedBuyers: c.interestedBuyers || 0,
    });
    console.log(`  ✓ ${c.crop} — ${c.farmerName}`);
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  console.log('\n📦 Seeding orders...');
  await Order.deleteMany({});

  for (const o of mockOrders) {
    const fId = farmerIdMap[o.farmerId];
    const bId = buyerIdMap[o.buyerId];
    if (!fId) { console.log(`  ⚠  Skipping order ${o.id}`); continue; }
    await Order.create({
      farmerId: fId, buyerId: bId || null, buyerName: o.buyerName,
      crop: o.crop, quantity: o.quantity, unit: o.unit,
      agreedPrice: o.agreedPrice, totalValue: o.totalValue,
      status: o.status,
      timeline: o.timeline.map(t => ({ step: t.step, status: t.status, date: t.date ? new Date(t.date) : null, note: t.note })),
      pickupLocation: o.pickupLocation, deliveryLocation: o.deliveryLocation,
      paymentStatus: o.paymentStatus, paymentAmount: o.paymentAmount || 0,
    });
    console.log(`  ✓ Order ${o.id} — ${o.buyerName}`);
  }

  // ── Buyer Requests ────────────────────────────────────────────────────────
  console.log('\n📩 Seeding buyer requests...');
  await BuyerRequest.deleteMany({});

  for (const r of mockRequests) {
    const fId = farmerIdMap[r.farmerId];
    const bId = buyerIdMap[r.buyerId];
    if (!fId) { console.log(`  ⚠  Skipping request ${r.id}`); continue; }
    await BuyerRequest.create({
      farmerId: fId, buyerId: bId || null, buyerName: r.buyerName,
      buyerType: r.buyerType, buyerLocation: r.buyerLocation,
      crop: r.crop, quantity: r.quantity, unit: r.unit,
      offeredPrice: r.offeredPrice, deliveryRequired: r.deliveryRequired,
      deliveryDate: r.deliveryDate, deliveryLocation: r.deliveryLocation,
      status: r.status, message: r.message,
      negotiationHistory: (r.negotiationHistory || []).map(n => ({
        from: n.from, price: n.price || null, message: n.message,
        timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
      })),
    });
    console.log(`  ✓ Request from ${r.buyerName} for ${r.crop}`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('📊 Summary:');
  console.log(`   Farmers:  ${await Farmer.countDocuments()}`);
  console.log(`   Buyers:   ${await Buyer.countDocuments()}`);
  console.log(`   Listings: ${await CropListing.countDocuments()}`);
  console.log(`   Orders:   ${await Order.countDocuments()}`);
  console.log(`   Requests: ${await BuyerRequest.countDocuments()}`);

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB\n');
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
