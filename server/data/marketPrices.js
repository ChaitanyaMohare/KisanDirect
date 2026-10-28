// Mock Market Price Data — replace with MongoDB / government API later
const marketPrices = [
  // ONION prices
  {
    id: 'MP001',
    crop: 'Onion',
    market: 'Lasalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    price: 3200,
    unit: 'Quintal',
    trend: 8,
    trendDirection: 'up',
    distance: 72,
    buyerDemand: 'High',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 2700 },
      { date: '2026-09-20', price: 2760 },
      { date: '2026-09-21', price: 2800 },
      { date: '2026-09-22', price: 2950 },
      { date: '2026-09-23', price: 3000 },
      { date: '2026-09-24', price: 3100 },
      { date: '2026-09-25', price: 3200 }
    ]
  },
  {
    id: 'MP002',
    crop: 'Onion',
    market: 'Pimpalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    price: 2950,
    unit: 'Quintal',
    trend: 3,
    trendDirection: 'up',
    distance: 91,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: false,
    priceHistory: [
      { date: '2026-09-19', price: 2600 },
      { date: '2026-09-20', price: 2650 },
      { date: '2026-09-21', price: 2700 },
      { date: '2026-09-22', price: 2780 },
      { date: '2026-09-23', price: 2850 },
      { date: '2026-09-24', price: 2900 },
      { date: '2026-09-25', price: 2950 }
    ]
  },
  {
    id: 'MP003',
    crop: 'Onion',
    market: 'Ahmednagar',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    price: 2700,
    unit: 'Quintal',
    trend: -2,
    trendDirection: 'down',
    distance: 45,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: false,
    priceHistory: [
      { date: '2026-09-19', price: 2750 },
      { date: '2026-09-20', price: 2720 },
      { date: '2026-09-21', price: 2700 },
      { date: '2026-09-22', price: 2680 },
      { date: '2026-09-23', price: 2700 },
      { date: '2026-09-24', price: 2720 },
      { date: '2026-09-25', price: 2700 }
    ]
  },
  {
    id: 'MP004',
    crop: 'Onion',
    market: 'Pune (Market Yard)',
    district: 'Pune',
    state: 'Maharashtra',
    price: 2850,
    unit: 'Quintal',
    trend: 5,
    trendDirection: 'up',
    distance: 125,
    buyerDemand: 'High',
    lastUpdated: '2026-09-25',
    isBestPrice: false,
    priceHistory: [
      { date: '2026-09-19', price: 2500 },
      { date: '2026-09-20', price: 2550 },
      { date: '2026-09-21', price: 2600 },
      { date: '2026-09-22', price: 2700 },
      { date: '2026-09-23', price: 2750 },
      { date: '2026-09-24', price: 2800 },
      { date: '2026-09-25', price: 2850 }
    ]
  },
  // WHEAT prices
  {
    id: 'MP005',
    crop: 'Wheat',
    market: 'Pune (Market Yard)',
    district: 'Pune',
    state: 'Maharashtra',
    price: 2400,
    unit: 'Quintal',
    trend: 1,
    trendDirection: 'up',
    distance: 120,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 2350 },
      { date: '2026-09-20', price: 2360 },
      { date: '2026-09-21', price: 2370 },
      { date: '2026-09-22', price: 2380 },
      { date: '2026-09-23', price: 2390 },
      { date: '2026-09-24', price: 2395 },
      { date: '2026-09-25', price: 2400 }
    ]
  },
  {
    id: 'MP006',
    crop: 'Wheat',
    market: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    price: 2250,
    unit: 'Quintal',
    trend: -1,
    trendDirection: 'down',
    distance: 65,
    buyerDemand: 'Low',
    lastUpdated: '2026-09-25',
    isBestPrice: false,
    priceHistory: [
      { date: '2026-09-19', price: 2300 },
      { date: '2026-09-20', price: 2290 },
      { date: '2026-09-21', price: 2280 },
      { date: '2026-09-22', price: 2270 },
      { date: '2026-09-23', price: 2260 },
      { date: '2026-09-24', price: 2255 },
      { date: '2026-09-25', price: 2250 }
    ]
  },
  // TOMATO prices
  {
    id: 'MP007',
    crop: 'Tomato',
    market: 'Nashik (Satpur)',
    district: 'Nashik',
    state: 'Maharashtra',
    price: 2200,
    unit: 'Quintal',
    trend: 12,
    trendDirection: 'up',
    distance: 90,
    buyerDemand: 'High',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 1600 },
      { date: '2026-09-20', price: 1700 },
      { date: '2026-09-21', price: 1800 },
      { date: '2026-09-22', price: 1900 },
      { date: '2026-09-23', price: 2000 },
      { date: '2026-09-24', price: 2100 },
      { date: '2026-09-25', price: 2200 }
    ]
  },
  {
    id: 'MP008',
    crop: 'Tomato',
    market: 'Ahmednagar',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    price: 1850,
    unit: 'Quintal',
    trend: 5,
    trendDirection: 'up',
    distance: 42,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: false,
    priceHistory: [
      { date: '2026-09-19', price: 1500 },
      { date: '2026-09-20', price: 1580 },
      { date: '2026-09-21', price: 1650 },
      { date: '2026-09-22', price: 1700 },
      { date: '2026-09-23', price: 1750 },
      { date: '2026-09-24', price: 1800 },
      { date: '2026-09-25', price: 1850 }
    ]
  },
  // SOYBEAN prices
  {
    id: 'MP009',
    crop: 'Soybean',
    market: 'Latur',
    district: 'Latur',
    state: 'Maharashtra',
    price: 4800,
    unit: 'Quintal',
    trend: 6,
    trendDirection: 'up',
    distance: 210,
    buyerDemand: 'High',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 4400 },
      { date: '2026-09-20', price: 4500 },
      { date: '2026-09-21', price: 4550 },
      { date: '2026-09-22', price: 4600 },
      { date: '2026-09-23', price: 4680 },
      { date: '2026-09-24', price: 4750 },
      { date: '2026-09-25', price: 4800 }
    ]
  },
  {
    id: 'MP010',
    crop: 'Soybean',
    market: 'Pune (Market Yard)',
    district: 'Pune',
    state: 'Maharashtra',
    price: 4550,
    unit: 'Quintal',
    trend: 3,
    trendDirection: 'up',
    distance: 125,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: false,
    priceHistory: [
      { date: '2026-09-19', price: 4200 },
      { date: '2026-09-20', price: 4280 },
      { date: '2026-09-21', price: 4350 },
      { date: '2026-09-22', price: 4400 },
      { date: '2026-09-23', price: 4450 },
      { date: '2026-09-24', price: 4500 },
      { date: '2026-09-25', price: 4550 }
    ]
  },
  // COTTON prices
  {
    id: 'MP011',
    crop: 'Cotton',
    market: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    price: 6800,
    unit: 'Quintal',
    trend: 4,
    trendDirection: 'up',
    distance: 480,
    buyerDemand: 'High',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 6400 },
      { date: '2026-09-20', price: 6480 },
      { date: '2026-09-21', price: 6520 },
      { date: '2026-09-22', price: 6600 },
      { date: '2026-09-23', price: 6680 },
      { date: '2026-09-24', price: 6740 },
      { date: '2026-09-25', price: 6800 }
    ]
  },
  // MAIZE prices
  {
    id: 'MP012',
    crop: 'Maize',
    market: 'Solapur',
    district: 'Solapur',
    state: 'Maharashtra',
    price: 1950,
    unit: 'Quintal',
    trend: 2,
    trendDirection: 'up',
    distance: 265,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 1850 },
      { date: '2026-09-20', price: 1870 },
      { date: '2026-09-21', price: 1890 },
      { date: '2026-09-22', price: 1910 },
      { date: '2026-09-23', price: 1920 },
      { date: '2026-09-24', price: 1940 },
      { date: '2026-09-25', price: 1950 }
    ]
  },
  // POTATO prices
  {
    id: 'MP013',
    crop: 'Potato',
    market: 'Pune (Market Yard)',
    district: 'Pune',
    state: 'Maharashtra',
    price: 1500,
    unit: 'Quintal',
    trend: -3,
    trendDirection: 'down',
    distance: 125,
    buyerDemand: 'Medium',
    lastUpdated: '2026-09-25',
    isBestPrice: true,
    priceHistory: [
      { date: '2026-09-19', price: 1600 },
      { date: '2026-09-20', price: 1580 },
      { date: '2026-09-21', price: 1560 },
      { date: '2026-09-22', price: 1540 },
      { date: '2026-09-23', price: 1520 },
      { date: '2026-09-24', price: 1510 },
      { date: '2026-09-25', price: 1500 }
    ]
  }
];

module.exports = marketPrices;
