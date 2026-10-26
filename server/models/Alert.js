const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['medical', 'food', 'fuel', 'quality', 'prevention', 'stock'],
    default: 'stock'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['FoodOrder', 'FuelOrder', 'FoodConsumption', 'FuelConsumption']
  },
  targetRole: {
    type: String,
    enum: ['admin', 'manager', 'employee', 'vet', 'food_supplier', 'fuel_supplier'],
    default: 'admin'
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

alertSchema.index({ createdAt: -1 });
alertSchema.index({ severity: 1, isActive: 1 });

module.exports = mongoose.model('Alert', alertSchema);