'use strict';
const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  companyName:      { type: String, trim: true, default: '' },
  mobile:           { type: String, required: true, unique: true, trim: true },
  email:            { type: String, trim: true, lowercase: true, default: null },
  businessType:     { type: String, default: '' },
  location:         { type: String, default: '' },
  district:         { type: String, default: '' },
  state:            { type: String, default: 'Maharashtra' },
  role:             { type: String, default: 'buyer' },
  isVerified:       { type: Boolean, default: false },
  businessVerified: { type: Boolean, default: false },
  mobileVerified:   { type: Boolean, default: false },
  emailVerified:    { type: Boolean, default: false },
  gstVerified:      { type: Boolean, default: false },
  gstNumber:        { type: String, default: null },
  preferredCrops:   [String],
  rating:           { type: Number, default: 0 },
  totalPurchases:   { type: Number, default: 0 },
  password:         { type: String, default: 'buyer123' },
}, { timestamps: true });

BuyerSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Buyer', BuyerSchema);
