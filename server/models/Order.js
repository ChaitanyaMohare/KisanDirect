'use strict';
const mongoose = require('mongoose');

const TimelineStepSchema = new mongoose.Schema({
  step:   String,
  status: { type: String, enum: ['completed', 'active', 'pending'], default: 'pending' },
  date:   { type: Date, default: null },
  note:   { type: String, default: '' },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  farmerId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  buyerId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
  buyerName:        String,
  crop:             String,
  quantity:         Number,
  unit:             { type: String, default: 'Quintal' },
  agreedPrice:      Number,
  totalValue:       Number,
  status:           { type: String, default: 'Requested' },
  timeline:         [TimelineStepSchema],
  pickupLocation:   String,
  deliveryLocation: String,
  paymentStatus:    { type: String, default: 'Not Started' },
  paymentAmount:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
