const mongoose = require('mongoose');

const mortalityRecordSchema = new mongoose.Schema(
  {
    batchId: {
      type: String, // flock/batch identifier
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalBirds: {
      type: Number,
      required: true,
      min: 1,
    },
    deadCount: {
      type: Number,
      required: true,
      min: 0,
    },
    mortalityRate: {
      type: Number, // percentage - set by the route before saving, not computed here
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MortalityRecord', mortalityRecordSchema);