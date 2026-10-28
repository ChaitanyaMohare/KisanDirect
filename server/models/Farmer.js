'use strict';
const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  mobile:            { type: String, required: true, unique: true, trim: true },
  email:             { type: String, trim: true, lowercase: true, default: null },
  password:          { type: String, required: true },
  village:           { type: String, trim: true, default: '' },
  district:          { type: String, trim: true, default: '' },
  state:             { type: String, trim: true, default: 'Maharashtra' },
  pincode:           { type: String, default: '' },
  preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'hi' },
  mainCrop:          { type: String, default: 'Onion' },
  landHolding:       { type: String, default: '' },
  role:              { type: String, default: 'farmer' },
  isVerified:        { type: Boolean, default: false },
  mobileVerified:    { type: Boolean, default: false },
  emailVerified:     { type: Boolean, default: false },
  farmerVerified:    { type: Boolean, default: false },
  locationVerified:  { type: Boolean, default: false },
  profileImage:      { type: String, default: null },
  totalEarnings:     { type: Number, default: 0 },
  activeListings:    { type: Number, default: 0 },
}, { timestamps: true });

// Remove password from JSON output
FarmerSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Farmer', FarmerSchema);
