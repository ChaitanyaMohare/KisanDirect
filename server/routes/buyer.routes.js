'use strict';
const express = require('express');
const router  = express.Router();
const Buyer   = require('../models/Buyer');

router.get('/', async (req, res) => {
  try {
    const buyers = await Buyer.find().select('-password');
    res.json({ success: true, count: buyers.length, data: buyers });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.id).select('-password');
    if (!buyer) return res.status(404).json({ success: false, message: 'Buyer not found' });
    res.json({ success: true, data: buyer });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
