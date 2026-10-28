'use strict';
const mongoose = require('mongoose');

const NegotiationMsgSchema = new mongoose.Schema({
  from:      { type: String, enum: ['buyer', 'farmer'] },
  price:     { type: Number, default: null },
  message:   String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const BuyerRequestSchema = new mongoose.Schema({
  farmerId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  buyerId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' },
  buyerName:          String,
  buyerType:          String,
  buyerLocation:      String,
  crop:               String,
  quantity:           Number,
  unit:               { type: String, default: 'Quintal' },
  offeredPrice:       Number,
  deliveryRequired:   Boolean,
  deliveryDate:       String,
  deliveryLocation:   String,
  status:             { type: String, enum: ['Pending','Negotiating','Accepted','Rejected'], default: 'Pending' },
  message:            String,
  negotiationHistory: [NegotiationMsgSchema],
}, { timestamps: true });

module.exports = mongoose.model('BuyerRequest', BuyerRequestSchema);
