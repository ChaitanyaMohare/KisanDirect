'use strict';
const express      = require('express');
const router       = express.Router();
const CropListing  = require('../models/CropListing');

// GET /api/crops
router.get('/', async (req, res) => {
  try {
    const { crop, district, state, quality, status } = req.query;
    const filter = {};
    if (crop)     filter.crop     = new RegExp(`^${crop}$`, 'i');
    if (district) filter.district = new RegExp(`^${district}$`, 'i');
    if (state)    filter.state    = new RegExp(`^${state}$`, 'i');
    if (quality)  filter.quality  = quality;
    if (status)   filter.status   = status;

    const results = await CropListing.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/crops/farmer/:farmerId
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const results = await CropListing.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/crops/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await CropListing.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/crops
router.post('/', async (req, res) => {
  try {
    const { farmerId, crop, quantity, expectedPrice } = req.body;
    if (!farmerId || !crop || !quantity || !expectedPrice) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    const item = await CropListing.create({ ...req.body, quantity: Number(quantity), expectedPrice: Number(expectedPrice) });
    res.status(201).json({ success: true, message: 'Crop listing created', data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// PUT /api/crops/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await CropListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, message: 'Listing updated', data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// DELETE /api/crops/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await CropListing.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, message: 'Listing deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
