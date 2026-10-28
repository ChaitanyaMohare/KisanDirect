'use strict';
/**
 * Notifications — still uses in-memory mock data.
 * Real-time notifications would need a Notification model + socket.io.
 * The mock data is sufficient for demo; replace with DB when adding real notifications.
 */
const express       = require('express');
const router        = express.Router();
const notifications = require('../data/notifications');

router.get('/', (req, res) => {
  const { userId } = req.query;
  const results = userId ? notifications.filter(n => n.userId === userId) : notifications;
  res.json({ success: true, count: results.length, data: results });
});

router.put('/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
  notif.isRead = true;
  res.json({ success: true, data: notif });
});

module.exports = router;
