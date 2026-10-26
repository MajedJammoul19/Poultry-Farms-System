const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['mortality_threshold'], // add more alert types here later if needed
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      enum: ['vet'],
      required: true,
    },
    relatedRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MortalityRecord',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MortalityAlert', alertSchema);