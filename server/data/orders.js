// Mock Orders Data — replace with MongoDB queries later
const orders = [
  {
    id: 'KD1024',
    farmerId: 'F001',
    buyerId: 'B001',
    buyerName: 'ABC Foods Pvt. Ltd.',
    crop: 'Onion',
    quantity: 30,
    unit: 'Quintal',
    agreedPrice: 3150,
    totalValue: 94500,
    status: 'In Transit',
    timeline: [
      { step: 'Buyer Request', status: 'completed', date: '2026-09-18T10:00:00.000Z', note: 'Buyer requested 30 quintals of Onion' },
      { step: 'Price Accepted', status: 'completed', date: '2026-09-19T11:00:00.000Z', note: 'Price agreed at ₹3,150/quintal' },
      { step: 'Pickup Scheduled', status: 'completed', date: '2026-09-21T09:00:00.000Z', note: 'Pickup scheduled for 23 September' },
      { step: 'In Transit', status: 'active', date: '2026-09-23T07:00:00.000Z', note: 'Truck departed from Ahmednagar' },
      { step: 'Completed', status: 'pending', date: null, note: '' }
    ],
    pickupLocation: 'Ahmednagar, Maharashtra',
    deliveryLocation: 'Pune, Maharashtra',
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-23T07:00:00.000Z',
    paymentStatus: 'Pending',
    paymentAmount: 94500
  },
  {
    id: 'KD1020',
    farmerId: 'F001',
    buyerId: 'B002',
    buyerName: 'FreshVeg Exports',
    crop: 'Onion',
    quantity: 50,
    unit: 'Quintal',
    agreedPrice: 3200,
    totalValue: 160000,
    status: 'Completed',
    timeline: [
      { step: 'Buyer Request', status: 'completed', date: '2026-09-05T10:00:00.000Z', note: 'Buyer requested 50 quintals of Onion' },
      { step: 'Price Accepted', status: 'completed', date: '2026-09-06T11:00:00.000Z', note: 'Price agreed at ₹3,200/quintal' },
      { step: 'Pickup Scheduled', status: 'completed', date: '2026-09-08T09:00:00.000Z', note: 'Pickup scheduled for 10 September' },
      { step: 'In Transit', status: 'completed', date: '2026-09-10T07:00:00.000Z', note: 'Truck departed' },
      { step: 'Completed', status: 'completed', date: '2026-09-11T14:00:00.000Z', note: 'Order delivered and payment received' }
    ],
    pickupLocation: 'Ahmednagar, Maharashtra',
    deliveryLocation: 'Nashik, Maharashtra',
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-11T14:00:00.000Z',
    paymentStatus: 'Paid',
    paymentAmount: 160000
  },
  {
    id: 'KD1022',
    farmerId: 'F001',
    buyerId: 'B004',
    buyerName: 'Nair Retail Chain',
    crop: 'Potato',
    quantity: 20,
    unit: 'Quintal',
    agreedPrice: 1200,
    totalValue: 24000,
    status: 'Negotiating',
    timeline: [
      { step: 'Buyer Request', status: 'completed', date: '2026-09-22T10:00:00.000Z', note: 'Buyer requested 20 quintals of Potato' },
      { step: 'Price Accepted', status: 'active', date: null, note: 'Negotiation in progress' },
      { step: 'Pickup Scheduled', status: 'pending', date: null, note: '' },
      { step: 'In Transit', status: 'pending', date: null, note: '' },
      { step: 'Completed', status: 'pending', date: null, note: '' }
    ],
    pickupLocation: 'Ahmednagar, Maharashtra',
    deliveryLocation: 'Mumbai, Maharashtra',
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
    paymentStatus: 'Not Started',
    paymentAmount: 0
  }
];

module.exports = orders;
