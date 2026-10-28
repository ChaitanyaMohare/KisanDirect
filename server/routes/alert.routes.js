'use strict';
const express    = require('express');
const router     = express.Router();
const PriceAlert = require('../models/PriceAlert');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.farmerId) filter.farmerId = req.query.farmerId;
    const results = await PriceAlert.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { farmerId, crop, targetPrice } = req.body;
    if (!farmerId || !crop || !targetPrice)
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    const item = await PriceAlert.create({ ...req.body, targetPrice: Number(targetPrice) });
    res.status(201).json({ success: true, message: 'Price alert set', data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await PriceAlert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alert removed' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
