/**
 * GET /api/mandi-prices
 *
 * Query params:
 *   state      (default: Maharashtra)
 *   commodity  (default: Onion)
 *   district   (optional, filters locally)
 *   market     (optional, filters locally)
 *   latestOnly (optional, "true" = only most recent arrival_date records — default true)
 *
 * Response:
 *   { success, count, data: [...records], meta, cachedAt, fromCache }
 */

const express = require('express');
const router = express.Router();
const { getPrices, extractDistricts, extractMarkets, filterLatestDate } = require('../services/mandiPrice.service');

// Supported states & commodities — extend this list as needed
const SUPPORTED_COMMODITIES = [
  'Onion', 'Wheat', 'Tomato', 'Potato', 'Soybean', 'Cotton', 'Maize',
  'Sugarcane', 'Rice', 'Bajra', 'Jowar', 'Tur', 'Gram'
];

router.get('/', async (req, res) => {
  const state = (req.query.state || 'Maharashtra').trim();
  const commodity = (req.query.commodity || 'Onion').trim();
  const districtFilter = (req.query.district || '').trim().toLowerCase();
  const marketFilter = (req.query.market || '').trim().toLowerCase();
  const latestOnly = req.query.latestOnly !== 'false'; // default true

  try {
    const { records, meta, cachedAt, fromCache } = await getPrices(state, commodity);

    // Apply latestOnly filter first
    let data = latestOnly ? filterLatestDate(records) : records;

    // Apply optional local filters
    if (districtFilter && districtFilter !== 'all') {
      data = data.filter(r => r.district?.toLowerCase().includes(districtFilter));
    }
    if (marketFilter && marketFilter !== 'all') {
      data = data.filter(r => r.market?.toLowerCase().includes(marketFilter));
    }

    // Sort by modal_price descending so highest price is first
    data = [...data].sort((a, b) => b.modal_price - a.modal_price);

    // Derive available filters from the full (unfiltered latest) set for dropdowns
    const latestRecords = latestOnly ? filterLatestDate(records) : records;
    const districts = extractDistricts(latestRecords);
    const markets = extractMarkets(latestRecords);

    // Determine best price record
    const bestPrice = data.length > 0 ? data[0] : null;

    res.json({
      success: true,
      count: data.length,
      data,
      bestPrice,
      districts,
      markets,
      meta: {
        ...meta,
        state,
        commodity,
        latestOnly,
        supportedCommodities: SUPPORTED_COMMODITIES
      },
      cachedAt: new Date(cachedAt).toISOString(),
      fromCache,
      dataNote: 'Prices are daily APMC mandi reports. Not real-time.'
    });
  } catch (err) {
    console.error('[MandiPrice]', err.message);
    res.status(503).json({
      success: false,
      message: err.message,
      hint: 'The mandi price API may be starting up (free tier cold start). Please retry in 30–60 seconds.'
    });
  }
});

// GET /api/mandi-prices/meta — returns supported options (no external call)
router.get('/meta', (req, res) => {
  res.json({
    success: true,
    supportedCommodities: [
      'Onion', 'Wheat', 'Tomato', 'Potato', 'Soybean', 'Cotton', 'Maize',
      'Sugarcane', 'Rice', 'Bajra', 'Jowar', 'Tur', 'Gram'
    ],
    supportedStates: ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka', 'Rajasthan', 'Madhya Pradesh']
  });
});

module.exports = router;
