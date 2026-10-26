const mongoose = require('mongoose');

const preventionPlanSchema = new mongoose.Schema({
  facilityName: {
    type: String,
    required: [true, 'اسم المنشأة مطلوب'],
    trim: true,
    maxlength: [150, 'اسم المنشأة لا يمكن أن يتجاوز 150 حرفاً']
  },
  location: {
    type: String,
    required: [true, 'الموقع مطلوب'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'التاريخ مطلوب'],
    default: Date.now
  },
  preventionPlan: {
    type: String,
    required: [true, 'يجب إدخال خطط الوقاية'],
    trim: true
  },
  recommendations: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const PreventionPlan = mongoose.model('PreventionPlan', preventionPlanSchema);

module.exports = PreventionPlan;