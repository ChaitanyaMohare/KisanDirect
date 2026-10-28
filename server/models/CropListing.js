'use strict';
const mongoose = require('mongoose');

const CropListingSchema = new mongoose.Schema({
  farmerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmerName:     { type: String, default: '' },
  farmerLocation: { type: String, default: '' },
  crop:           { type: String, required: true },
  variety:        { type: String, default: '' },
  quantity:       { type: Number, required: true },
  unit:           { type: String, default: 'Quintal' },
  expectedPrice:  { type: Number, required: true },
  harvestDate:    { type: String, default: '' },
  quality:        { type: String, default: 'Grade A' },
  location:       { type: String, default: '' },
  district:       { type: String, default: '' },
  state:          { type: String, default: 'Maharashtra' },
  description:    { type: String, default: '' },
  availableFrom:  { type: String, default: '' },
  status:         { type: String, enum: ['Active', 'Paused', 'Sold', 'Expired'], default: 'Active' },
  views:          { type: Number, default: 0 },
  interestedBuyers: { type: Number, default: 0 },
  images:         [String],
}, { timestamps: true });

module.exports = mongoose.model('CropListing', CropListingSchema);
