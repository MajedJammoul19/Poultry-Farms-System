const mongoose = require('mongoose');

const packingOperationSchema = new mongoose.Schema({
  // معلومات المشغل
  operatorName: {
    type: String,
    required: [true, 'اسم المشغل مطلوب'],
    trim: true
  },
  shift: {
    type: String,
    required: [true, 'الوردية مطلوبة'],
    enum: ['صباحية', 'مسائية', 'ليلية'],
    default: 'صباحية'
  },
  
  // معلومات المنتج
  productType: {
    type: String,
    required: [true, 'نوع المنتج مطلوب'],
    enum: ['بيض طازج', 'بيض مبرد', 'لحم دجاج', 'لحم بط', 'علف', 'أخرى'],
    default: 'بيض طازج'
  },
  batchNumber: {
    type: String,
    required: [true, 'رقم الدفعة مطلوب'],
    trim: true
  },
  
  // عمليات الفرز
  sortingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalQuantity: {
    type: Number,
    required: [true, 'الكمية الإجمالية مطلوبة'],
    min: 0
  },
  
  // نتائج الفرز حسب الجودة
  gradeA: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    description: 'الدرجة الممتازة'
  },
  gradeB: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    description: 'الدرجة الجيدة'
  },
  gradeC: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    description: 'الدرجة المقبولة'
  },
  rejected: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    description: 'المنتجات المرفوضة'
  },
  
  // معايير الفرز
  sortingCriteria: {
    type: String,
    enum: ['حجم', 'وزن', 'لون', 'جودة شاملة', 'أخرى'],
    default: 'جودة شاملة'
  },
  
  // عمليات التعبئة
  packingType: {
    type: String,
    enum: ['كرتون', 'بلاستيك', 'خشب', 'أكياس', 'أخرى'],
    default: 'كرتون'
  },
  packagesCount: {
    type: Number,
    required: true,
    min: 0,
    description: 'عدد العبوات'
  },
  weightPerPackage: {
    type: Number,
    description: 'الوزن لكل عبوة (كجم)'
  },
  totalWeight: {
    type: Number,
    description: 'الوزن الإجمالي (كجم)'
  },
  
  // معلومات التخزين
  storageLocation: {
    type: String,
    trim: true,
    description: 'موقع التخزين'
  },
  temperature: {
    type: Number,
    description: 'درجة الحرارة (مئوية)'
  },
  humidity: {
    type: Number,
    description: 'نسبة الرطوبة (%)'
  },
  
  // معدات مستخدمة
  equipmentUsed: {
    type: String,
    trim: true,
    default: ''
  },
  
  // ملاحظات إضافية
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // وقت الانتهاء
  completionTime: {
    type: Date,
    default: Date.now
  },
  
  // حالة العملية
  status: {
    type: String,
    enum: ['قيد التنفيذ', 'مكتملة', 'مراجعة'],
    default: 'مكتملة'
  }
}, {
  timestamps: true
});

// إضافة فهارس للبحث
packingOperationSchema.index({ operatorName: 1, sortingDate: -1 });
packingOperationSchema.index({ batchNumber: 1, productType: 1 });
packingOperationSchema.index({ sortingDate: -1 });

// دالة لحساب الإجماليات تلقائياً
packingOperationSchema.pre('save', function() {
  // التحقق من تطابق الكميات
  const total = this.gradeA + this.gradeB + this.gradeC + this.rejected;
  if (total !== this.totalQuantity) {
    throw new Error('مجموع الدرجات لا يساوي الكمية الإجمالية');
  }
  
  // حساب الوزن الإجمالي إذا لم يتم إدخاله
  if (!this.totalWeight && this.weightPerPackage && this.packagesCount) {
    this.totalWeight = this.weightPerPackage * this.packagesCount;
  }
  
  return;
});

// دالة للحصول على إحصائيات العمليات
packingOperationSchema.statics.getStatistics = async function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.sortingDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$productType',
        totalQuantity: { $sum: '$totalQuantity' },
        totalGradeA: { $sum: '$gradeA' },
        totalGradeB: { $sum: '$gradeB' },
        totalGradeC: { $sum: '$gradeC' },
        totalRejected: { $sum: '$rejected' },
        operationCount: { $sum: 1 },
        avgTemperature: { $avg: '$temperature' }
      }
    }
  ]);
};

module.exports = mongoose.model('PackingOperation', packingOperationSchema);
