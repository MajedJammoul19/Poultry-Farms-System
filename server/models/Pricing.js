const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  supplierId: { type: String, default: null },
  product:    { type: String, required: true },
  type:       { type: String, required: true },
  weight:     { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  minOrder:   { type: Number, required: true },
  date:       { type: String, required: true },
  available:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema);
