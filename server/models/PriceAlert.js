'use strict';
const mongoose = require('mongoose');

const PriceAlertSchema = new mongoose.Schema({
  farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  crop:        { type: String, required: true },
  targetPrice: { type: Number, required: true },
  market:      { type: String, default: '' },
  unit:        { type: String, default: 'Quintal' },
  isActive:    { type: Boolean, default: true },
  triggered:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PriceAlert', PriceAlertSchema);
