'use strict';
/**
 * Transport — uses mock data (no Transport model needed for MVP).
 * Replace with a TransportProvider model when onboarding real logistics partners.
 */
const express            = require('express');
const router             = express.Router();
const transportProviders = require('../data/transport');

router.get('/', (req, res) => {
  const { location, capacity } = req.query;
  let results = [...transportProviders];
  if (location) results = results.filter(t => t.location.toLowerCase().includes(location.toLowerCase()));
  if (capacity) results = results.filter(t => t.capacity >= Number(capacity));
  res.json({ success: true, count: results.length, data: results });
});

router.get('/:id', (req, res) => {
  const provider = transportProviders.find(t => t.id === req.params.id);
  if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
  res.json({ success: true, data: provider });
});

module.exports = router;
