const mongoose = require('mongoose');

const managerRecommendationSchema = new mongoose.Schema({
  productivityIssues: {
    type: String,
    required: [true, 'المشاكل الحالية في الإنتاجية مطلوبة'],
    trim: true,
    minlength: [10, 'يجب أن لا تقل المشاكل عن 10 أحرف'],
    maxlength: [1000, 'يجب أن لا تزيد المشاكل عن 1000 حرف']
  },
  improvementSuggestions: {
    type: String,
    required: [true, 'الحلول والتحسينات المقترحة مطلوبة'],
    trim: true,
    minlength: [10, 'يجب أن لا تقل الحلول عن 10 أحرف'],
    maxlength: [1000, 'يجب أن لا تزيد الحلول عن 1000 حرف']
  },
  requiredResources: {
    type: String,
    trim: true,
    maxlength: [500, 'يجب أن لا تزيد الموارد المطلوبة عن 500 حرف'],
    default: ''
  },
  expectedOutcomes: {
    type: String,
    trim: true,
    maxlength: [500, 'يجب أن لا تزيد النتائج المتوقعة عن 500 حرف'],
    default: ''
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'يجب أن لا تزيد الملاحظات الإضافية عن 500 حرف'],
    default: ''
  },
  status: {
    type: String,
    enum: ['قيد المراجعة', 'قيد التنفيذ', 'تم التنفيذ', 'مرفوض'],
    default: 'قيد المراجعة'
  },
  priority: {
    type: String,
    enum: ['عالي', 'متوسط', 'منخفض'],
    default: 'متوسط'
  },
  // إزالة createdBy, reviewedBy (لا حاجة لها بدون مصادقة)
  submitterName: {
    type: String,
    trim: true,
    default: 'زائر'
  },
  submitterEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  reviewNotes: {
    type: String,
    trim: true,
    default: ''
  },
  reviewedAt: {
    type: Date
  },
  implementedAt: {
    type: Date
  },
  implementationNotes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// إضافة فهرس للبحث السريع
managerRecommendationSchema.index({ status: 1, priority: 1, createdAt: -1 });

// دالة للحصول على التوصيات النشطة
managerRecommendationSchema.statics.getActiveRecommendations = function() {
  return this.find({ status: { $ne: 'تم التنفيذ' } }).sort({ priority: 1, createdAt: -1 });
};

// دالة لتحديث حالة التوصية
managerRecommendationSchema.methods.updateStatus = async function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) this.reviewNotes = notes;
  if (newStatus !== 'قيد المراجعة') {
    this.reviewedAt = new Date();
  }
  if (newStatus === 'تم التنفيذ') {
    this.implementedAt = new Date();
  }
  return await this.save();
};

module.exports = mongoose.model('ManagerRecommendation', managerRecommendationSchema);