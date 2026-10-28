'use strict';
const express = require('express');
const router  = express.Router();
const Report  = require('../models/Report');

router.post('/', async (req, res) => {
  try {
    const { listingId, reason } = req.body;
    if (!listingId || !reason)
      return res.status(400).json({ success: false, message: 'listingId and reason are required' });
    const report = await Report.create(req.body);
    res.status(201).json({ success: true, message: 'Report submitted', data: report });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reports.length, data: reports });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
