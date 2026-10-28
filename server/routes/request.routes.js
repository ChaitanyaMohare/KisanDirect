'use strict';
const express       = require('express');
const router        = express.Router();
const BuyerRequest  = require('../models/BuyerRequest');

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.farmerId) filter.farmerId = req.query.farmerId;
    if (req.query.status)   filter.status   = req.query.status;
    const results = await BuyerRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await BuyerRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const item = await BuyerRequest.create(req.body);
    res.status(201).json({ success: true, message: 'Request submitted', data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await BuyerRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request updated', data: item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
