// Mock Buyer Requests Data — replace with MongoDB queries later
const requests = [
  {
    id: 'REQ001',
    farmerId: 'F001',
    buyerId: 'B001',
    buyerName: 'ABC Foods Pvt. Ltd.',
    buyerType: 'Processor',
    buyerLocation: 'Pune, Maharashtra',
    crop: 'Onion',
    quantity: 30,
    unit: 'Quintal',
    offeredPrice: 3150,
    deliveryRequired: true,
    deliveryDate: '2026-09-30',
    deliveryLocation: 'Pune, Maharashtra',
    status: 'Pending',
    message: 'We need Grade A onions for processing. Can deliver within 7 days.',
    createdAt: '2026-09-23T10:00:00.000Z',
    negotiationHistory: []
  },
  {
    id: 'REQ002',
    farmerId: 'F001',
    buyerId: 'B002',
    buyerName: 'FreshVeg Exports',
    buyerType: 'Exporter',
    buyerLocation: 'Nashik, Maharashtra',
    crop: 'Onion',
    quantity: 50,
    unit: 'Quintal',
    offeredPrice: 3000,
    deliveryRequired: false,
    deliveryDate: '2026-10-05',
    deliveryLocation: 'Nashik, Maharashtra',
    status: 'Negotiating',
    message: 'Looking for export quality onions. FOB Nashik.',
    createdAt: '2026-09-22T08:00:00.000Z',
    negotiationHistory: [
      { from: 'buyer', price: 3000, message: 'Initial offer: ₹3,000/quintal', timestamp: '2026-09-22T08:00:00.000Z' },
      { from: 'farmer', price: 3200, message: 'Counter offer: ₹3,200/quintal — market price at Lasalgaon today.', timestamp: '2026-09-22T11:00:00.000Z' },
      { from: 'buyer', price: 3100, message: 'We can offer ₹3,100/quintal, final offer.', timestamp: '2026-09-22T14:00:00.000Z' }
    ]
  },
  {
    id: 'REQ003',
    farmerId: 'F001',
    buyerId: 'B004',
    buyerName: 'Nair Retail Chain',
    buyerType: 'Retailer',
    buyerLocation: 'Mumbai, Maharashtra',
    crop: 'Potato',
    quantity: 20,
    unit: 'Quintal',
    offeredPrice: 1150,
    deliveryRequired: true,
    deliveryDate: '2026-09-28',
    deliveryLocation: 'Mumbai, Maharashtra',
    status: 'Accepted',
    message: 'Regular supply needed for retail chain. Monthly orders possible.',
    createdAt: '2026-09-21T12:00:00.000Z',
    negotiationHistory: [
      { from: 'buyer', price: 1150, message: 'Offer: ₹1,150/quintal', timestamp: '2026-09-21T12:00:00.000Z' },
      { from: 'farmer', price: 1200, message: 'Minimum ₹1,200/quintal.', timestamp: '2026-09-21T15:00:00.000Z' },
      { from: 'buyer', price: 1200, message: 'Accepted ₹1,200/quintal. Please confirm.', timestamp: '2026-09-22T09:00:00.000Z' }
    ]
  },
  {
    id: 'REQ004',
    farmerId: 'F001',
    buyerId: 'B003',
    buyerName: 'Desai Agro Traders',
    buyerType: 'Trader',
    buyerLocation: 'Ahmednagar, Maharashtra',
    crop: 'Onion',
    quantity: 25,
    unit: 'Quintal',
    offeredPrice: 2900,
    deliveryRequired: false,
    deliveryDate: '2026-09-27',
    deliveryLocation: 'Ahmednagar, Maharashtra',
    status: 'Rejected',
    message: 'Local pickup only. Need within 2 days.',
    createdAt: '2026-09-20T10:00:00.000Z',
    negotiationHistory: [
      { from: 'buyer', price: 2900, message: 'Offer: ₹2,900/quintal', timestamp: '2026-09-20T10:00:00.000Z' },
      { from: 'farmer', price: null, message: 'Rejected — price too low. Current Lasalgaon price is ₹3,200.', timestamp: '2026-09-20T14:00:00.000Z' }
    ]
  }
];

module.exports = requests;
