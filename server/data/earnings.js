// Mock Earnings Data — replace with MongoDB queries later
const earnings = {
  F001: {
    farmerId: 'F001',
    totalEarnings: 482500,
    thisMonth: 82300,
    thisYear: 482500,
    pendingPayments: 24000,
    completedPayments: 458500,
    monthlyData: [
      { month: 'Jan 2026', earnings: 42000 },
      { month: 'Feb 2026', earnings: 38000 },
      { month: 'Mar 2026', earnings: 65000 },
      { month: 'Apr 2026', earnings: 55000 },
      { month: 'May 2026', earnings: 48000 },
      { month: 'Jun 2026', earnings: 32000 },
      { month: 'Jul 2026', earnings: 45000 },
      { month: 'Aug 2026', earnings: 75200 },
      { month: 'Sep 2026', earnings: 82300 }
    ],
    transactions: [
      {
        id: 'TXN001',
        orderId: 'KD1020',
        buyerName: 'FreshVeg Exports',
        crop: 'Onion',
        quantity: 50,
        unit: 'Quintal',
        pricePerUnit: 3200,
        amount: 160000,
        status: 'Paid',
        date: '2026-09-11T14:00:00.000Z'
      },
      {
        id: 'TXN002',
        orderId: 'KD1018',
        buyerName: 'ABC Foods Pvt. Ltd.',
        crop: 'Onion',
        quantity: 40,
        unit: 'Quintal',
        pricePerUnit: 3050,
        amount: 122000,
        status: 'Paid',
        date: '2026-08-25T10:00:00.000Z'
      },
      {
        id: 'TXN003',
        orderId: 'KD1015',
        buyerName: 'Nair Retail Chain',
        crop: 'Potato',
        quantity: 30,
        unit: 'Quintal',
        pricePerUnit: 1200,
        amount: 36000,
        status: 'Paid',
        date: '2026-08-10T11:00:00.000Z'
      },
      {
        id: 'TXN004',
        orderId: 'KD1024',
        buyerName: 'ABC Foods Pvt. Ltd.',
        crop: 'Onion',
        quantity: 30,
        unit: 'Quintal',
        pricePerUnit: 3150,
        amount: 94500,
        status: 'Pending',
        date: '2026-09-18T10:00:00.000Z'
      }
    ]
  }
};

module.exports = earnings;
