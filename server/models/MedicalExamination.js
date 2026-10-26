const mongoose = require('mongoose');

const medicalExaminationSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'التاريخ مطلوب'],
    default: Date.now
  },
  vetName: {
    type: String,
    required: [true, 'اسم الطبيب البيطري مطلوب'],
    trim: true,
    maxlength: [100, 'اسم الطبيب لا يمكن أن يتجاوز 100 حرف']
  },
  location: {
    type: String,
    required: [true, 'الموقع مطلوب'],
    trim: true
  },
  chickenCount: {
    type: Number,
    required: [true, 'عدد الدجاج مطلوب'],
    min: [1, 'يجب أن يكون العدد على الأقل 1']
  },
  healthStatus: {
    type: String,
    required: [true, 'الحالة الصحية مطلوبة'],
    enum: {
      values: ['ممتاز', 'جيد', 'متوسط', 'ضعيف', 'حرج', 'صحي', 'غير صحي'],
      message: 'الحالة الصحية يجب أن تكون إحدى القيم: ممتاز، جيد، متوسط، ضعيف، حرج، صحي، غير صحي'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'لا يمكن أن تتجاوز الملاحظات 1000 حرف'],
    default: ''
  },
  dailyMortalityCount: {
    type: Number,
    default: 0,
    min: [0, 'عدد الوفيات لا يمكن أن يكون سالباً'],
    required: [true, 'عدد حالات النفوق اليومية مطلوب']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('MedicalExamination', medicalExaminationSchema);