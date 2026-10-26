const mongoose = require('mongoose');

const feedingPlanSchema = new mongoose.Schema({
  // معلومات أساسية
  planName: {
    type: String,
    required: [true, 'اسم الخطة مطلوب'],
    trim: true,
    unique: true
  },
  poultryType: {
    type: String,
    required: [true, 'نوع الدواجن مطلوب'],
    enum: ['دجاج لاحم', 'دجاج بياض', 'بط', 'حمام', 'سمان', 'ديك رومي'],
    default: 'دجاج لاحم'
  },
  ageRange: {
    type: String,
    required: [true, 'الفئة العمرية مطلوبة'],
    trim: true
  },
  
  // تفاصيل التغذية
  feedType: {
    type: String,
    required: [true, 'نوع العلف مطلوب'],
    enum: ['بادئ', 'نامي', 'ناهي', 'بياض', 'خاص'],
    default: 'بادئ'
  },
  dailyAmount: {
    type: Number,
    required: [true, 'الكمية اليومية مطلوبة'],
    min: 0,
    description: 'الكمية بالجرام لكل طائر'
  },
  feedingFrequency: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    default: 3,
    description: 'عدد مرات التغذية يومياً'
  },
  
  // المكونات الغذائية
  proteinPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'نسبة البروتين المئوية'
  },
  energyContent: {
    type: Number,
    required: true,
    description: 'محتوى الطاقة (كيلو كالوري/كجم)'
  },
  ingredients: {
    type: String,
    required: true,
    trim: true,
    description: 'المكونات المستخدمة'
  },
  
  // إضافات
  supplements: {
    type: String,
    trim: true,
    default: '',
    description: 'المكملات الغذائية'
  },
  vitamins: {
    type: String,
    trim: true,
    default: '',
    description: 'الفيتامينات المضافة'
  },
  
  // الجدول الزمني
  startDay: {
    type: Number,
    required: true,
    min: 0,
    description: 'يوم البدء'
  },
  endDay: {
    type: Number,
    required: true,
    min: 0,
    description: 'يوم الانتهاء'
  },
  
  // توصيات خاصة
  specialInstructions: {
    type: String,
    trim: true,
    default: '',
    description: 'تعليمات خاصة'
  },
  waterRequirements: {
    type: String,
    trim: true,
    default: '',
    description: 'متطلبات المياه'
  },
  
  // معلومات إضافية
  expectedWeight: {
    type: Number,
    description: 'الوزن المتوقع بالجرام'
  },
  conversionRate: {
    type: Number,
    description: 'معدل تحويل العلف'
  },
  
  // حالة الخطة
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'مدير النظام'
  }
}, {
  timestamps: true
});

// إضافة فهارس للبحث
feedingPlanSchema.index({ poultryType: 1, ageRange: 1 });
feedingPlanSchema.index({ planName: 1 });

// دالة للحصول على الخطط النشطة
feedingPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ poultryType: 1, startDay: 1 });
};

// التحقق من صحة التواريخ
feedingPlanSchema.pre('save', function(next) {
  if (this.startDay >= this.endDay) {
    return next(new Error('يجب أن يكون يوم البدء أقل من يوم الانتهاء'));
  }
  next();
});

module.exports = mongoose.model('FeedingPlan', feedingPlanSchema);
