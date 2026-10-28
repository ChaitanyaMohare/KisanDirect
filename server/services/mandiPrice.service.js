/**
 * Mandi Price Service
 * Proxies https://mandi-api.onrender.com/v1/prices
 * with in-memory caching (60-minute TTL) and timeout handling.
 *
 * To swap to MongoDB later: replace the cache store with a DB collection
 * and write fetchedAt + records to it. The controller interface stays the same.
 */

const https = require('https');

const MANDI_API_BASE = 'https://mandi-api.onrender.com/v1/prices';
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes
const REQUEST_TIMEOUT_MS = 15000;     // 15 seconds — free tier has cold starts

// In-memory cache keyed by "state::commodity"
const cache = new Map();

/**
 * Fetch prices from external API with timeout.
 * Returns the raw parsed JSON body.
 */
function fetchFromAPI(state, commodity) {
  return new Promise((resolve, reject) => {
    const url = `${MANDI_API_BASE}?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`;
    const req = https.get(url, { timeout: REQUEST_TIMEOUT_MS }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Mandi API returned HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error('Invalid JSON from Mandi API'));
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Mandi API request timed out (possible cold start — retry in a moment)'));
    });
    req.on('error', reject);
  });
}

/**
 * Get prices with caching.
 * @param {string} state   e.g. "Maharashtra"
 * @param {string} commodity e.g. "Onion"
 * @returns {{ records, meta, cachedAt, fromCache }}
 */
async function getPrices(state, commodity) {
  const key = `${state.toLowerCase()}::${commodity.toLowerCase()}`;
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return { ...cached, fromCache: true };
  }

  const json = await fetchFromAPI(state, commodity);

  // Validate expected shape
  if (!json || !Array.isArray(json.data)) {
    throw new Error('Unexpected response structure from Mandi API');
  }

  const entry = {
    records: json.data,
    meta: json.meta || {},
    cachedAt: now,
    fromCache: false
  };
  cache.set(key, entry);
  return entry;
}

/**
 * Extract unique districts from a records array.
 */
function extractDistricts(records) {
  return [...new Set(records.map(r => r.district).filter(Boolean))].sort();
}

/**
 * Extract unique markets from a records array.
 */
function extractMarkets(records) {
  return [...new Set(records.map(r => r.market?.trim()).filter(Boolean))].sort();
}

/**
 * Get only the latest arrival_date records from a set.
 * The API returns multiple days; we surface the most recent by default.
 */
function filterLatestDate(records) {
  if (!records.length) return [];
  const latestDate = records.reduce((latest, r) => {
    return r.arrival_date > latest ? r.arrival_date : latest;
  }, '');
  return records.filter(r => r.arrival_date === latestDate);
}

module.exports = { getPrices, extractDistricts, extractMarkets, filterLatestDate };
