'use strict';
/**
 * Earnings — aggregates real order data from MongoDB.
 * Falls back to mock data for farmers with no orders yet.
 */
const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const mockEarnings = require('../data/earnings');

router.get('/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Aggregate from real orders
    const orders = await Order.find({ farmerId, status: 'Completed' });

    if (orders.length > 0) {
      const totalEarnings     = orders.reduce((s, o) => s + (o.totalValue || 0), 0);
      const now               = new Date();
      const thisMonth         = orders
        .filter(o => new Date(o.updatedAt).getMonth() === now.getMonth())
        .reduce((s, o) => s + (o.totalValue || 0), 0);
      const pendingOrders     = await Order.find({ farmerId, paymentStatus: 'Pending' });
      const pendingPayments   = pendingOrders.reduce((s, o) => s + (o.totalValue || 0), 0);

      // Build monthly data from orders
      const monthlyMap = {};
      orders.forEach(o => {
        const label = new Date(o.updatedAt).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
        monthlyMap[label] = (monthlyMap[label] || 0) + (o.totalValue || 0);
      });
      const monthlyData = Object.entries(monthlyMap).map(([month, earnings]) => ({ month, earnings }));

      const transactions = orders.map(o => ({
        id:          o._id,
        orderId:     o._id,
        buyerName:   o.buyerName,
        crop:        o.crop,
        quantity:    o.quantity,
        unit:        o.unit,
        pricePerUnit:o.agreedPrice,
        amount:      o.totalValue,
        status:      o.paymentStatus,
        date:        o.updatedAt,
      }));

      return res.json({
        success: true,
        data: { farmerId, totalEarnings, thisMonth, thisYear: totalEarnings, pendingPayments, completedPayments: totalEarnings - pendingPayments, monthlyData, transactions }
      });
    }

    // No real orders yet — return mock data for demo farmers
    const mock = mockEarnings[farmerId];
    if (mock) return res.json({ success: true, data: mock });

    // Brand new farmer — return zeros
    res.json({
      success: true,
      data: { farmerId, totalEarnings: 0, thisMonth: 0, thisYear: 0, pendingPayments: 0, completedPayments: 0, monthlyData: [], transactions: [] }
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
