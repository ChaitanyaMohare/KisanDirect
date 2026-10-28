'use strict';
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  listingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'CropListing' },
  reason:      String,
  description: String,
  reportedBy:  String,
  status:      { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
