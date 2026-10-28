'use strict';
const express      = require('express');
const router       = express.Router();
const Farmer       = require('../models/Farmer');
const Buyer        = require('../models/Buyer');
const CropListing  = require('../models/CropListing');
const Order        = require('../models/Order');
const Report       = require('../models/Report');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalFarmers, totalBuyers, activeListings, completedOrders, reportedListings] = await Promise.all([
      Farmer.countDocuments(),
      Buyer.countDocuments(),
      CropListing.countDocuments({ status: 'Active' }),
      Order.countDocuments({ status: 'Completed' }),
      Report.countDocuments({ status: 'Pending' }),
    ]);
    const valueAgg = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalValue' } } },
    ]);
    const totalTransactionValue = valueAgg[0]?.total || 0;
    const volAgg = await Order.aggregate([
      { $group: { _id: null, vol: { $sum: '$quantity' } } },
    ]);
    const totalCropVolume = `${(volAgg[0]?.vol || 0).toLocaleString('en-IN')} Quintal`;

    res.json({
      success: true,
      data: { totalFarmers, totalBuyers, activeListings, completedTransactions: completedOrders, totalCropVolume, reportedListings, totalTransactionValue },
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/admin/farmers
router.get('/farmers', async (req, res) => {
  try {
    const list = await Farmer.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/admin/buyers
router.get('/buyers', async (req, res) => {
  try {
    const list = await Buyer.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/admin/listings
router.get('/listings', async (req, res) => {
  try {
    const list = await CropListing.find().sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const list = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT /api/admin/farmers/:id/verify
router.put('/farmers/:id/verify', async (req, res) => {
  try {
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { farmerVerified: true, isVerified: true },
      { new: true }
    ).select('-password');
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, message: 'Farmer verified', data: farmer });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT /api/admin/buyers/:id/verify
router.put('/buyers/:id/verify', async (req, res) => {
  try {
    const buyer = await Buyer.findByIdAndUpdate(
      req.params.id,
      { businessVerified: true, isVerified: true },
      { new: true }
    ).select('-password');
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });
    res.json({ success: true, message: 'Buyer verified', data: buyer });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT /api/admin/listings/:id/remove
router.put('/listings/:id/remove', async (req, res) => {
  try {
    await CropListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
