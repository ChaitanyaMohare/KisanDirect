// Core utility functions for farmer earnings calculations
// These are pure functions, easy to test and replace with API-backed logic later

/**
 * Calculate net earning for a given market option
 * @param {number} quantity - in quintals
 * @param {number} pricePerQuintal - market price
 * @param {number} transportCost - estimated transport cost
 * @param {number} otherCosts - other misc costs
 * @returns {object} breakdown of earnings
 */
export const calculateNetEarning = (quantity, pricePerQuintal, transportCost = 0, otherCosts = 0) => {
  const grossRevenue = quantity * pricePerQuintal;
  const totalDeductions = transportCost + otherCosts;
  const netEarning = grossRevenue - totalDeductions;
  return {
    grossRevenue,
    transportCost,
    otherCosts,
    totalDeductions,
    netEarning,
    pricePerQuintal,
    quantity
  };
};

/**
 * Estimate transport cost based on distance and quantity
 * Base rate: ₹100/km for first 50km, ₹80/km after
 * Quantity factor: base 5 tons, +₹500 per additional 5 tons
 */
export const estimateTransportCost = (distanceKm, quantityQuintals) => {
  const tons = quantityQuintals / 10;
  let baseCost;
  if (distanceKm <= 50) {
    baseCost = distanceKm * 100;
  } else {
    baseCost = 50 * 100 + (distanceKm - 50) * 80;
  }
  const quantityFactor = Math.ceil(tons / 5) * 500;
  return Math.round(baseCost + quantityFactor);
};

/**
 * Generate smart selling recommendations
 * @param {string} crop
 * @param {number} quantity - quintals
 * @param {string} farmerLocation
 * @param {Array} marketPrices - array of market price objects
 * @returns {Array} sorted recommendations with net earnings
 */
export const generateSellingRecommendations = (crop, quantity, farmerLocation, marketPrices) => {
  const cropPrices = marketPrices.filter(m => m.crop === crop);
  const recommendations = cropPrices.map(market => {
    const transportCost = estimateTransportCost(market.distance, quantity);
    const { grossRevenue, netEarning } = calculateNetEarning(quantity, market.price, transportCost);
    return {
      market: market.market,
      district: market.district,
      pricePerQuintal: market.price,
      distance: market.distance,
      buyerDemand: market.buyerDemand,
      transportCost,
      grossRevenue,
      netEarning,
      trend: market.trend,
      trendDirection: market.trendDirection
    };
  });
  // Sort by net earning descending — best deal first
  recommendations.sort((a, b) => b.netEarning - a.netEarning);
  if (recommendations.length > 0) {
    recommendations[0].isRecommended = true;
    if (recommendations.length > 1) {
      const extra = recommendations[0].netEarning - recommendations[recommendations.length - 1].netEarning;
      recommendations[0].potentialExtra = extra;
    }
  }
  return recommendations;
};

/**
 * Format Indian number with commas (e.g., 1,50,000)
 */
export const formatIndianCurrency = (num) => {
  if (num === null || num === undefined) return '0';
  const str = Math.round(num).toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formatted = otherNumbers !== ''
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree;
  return '₹' + formatted;
};

/**
 * Format number without currency symbol
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  const str = Math.round(num).toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  return otherNumbers !== ''
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree;
};

/**
 * Calculate percentage change
 */
export const calcPercentChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};
