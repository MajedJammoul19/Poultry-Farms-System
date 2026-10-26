const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'vet', 'employee', 'fuel_supplier', 'food_supplier'],
    default: 'employee'
  },
  permissions: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Role', roleSchema);