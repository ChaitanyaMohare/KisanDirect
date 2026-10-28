const express = require('express');
const router = express.Router();
const marketPrices = require('../data/marketPrices');

// GET /api/market-prices
router.get('/', (req, res) => {
  const { crop, district, state } = req.query;
  let results = [...marketPrices];
  if (crop) results = results.filter(p => p.crop.toLowerCase() === crop.toLowerCase());
  if (district) results = results.filter(p => p.district.toLowerCase() === district.toLowerCase());
  if (state) results = results.filter(p => p.state.toLowerCase() === state.toLowerCase());
  // Sort by price descending
  results.sort((a, b) => b.price - a.price);
  if (results.length > 0) results[0].isBestPrice = true;
  res.json({ success: true, count: results.length, data: results });
});

// GET /api/market-prices/:crop
router.get('/:crop', (req, res) => {
  const results = marketPrices
    .filter(p => p.crop.toLowerCase() === req.params.crop.toLowerCase())
    .sort((a, b) => b.price - a.price);
  if (results.length === 0) return res.status(404).json({ success: false, message: 'No price data found for this crop' });
  // Mark best price
  results[0].isBestPrice = true;
  res.json({ success: true, count: results.length, data: results, bestPrice: results[0] });
});

module.exports = router;
