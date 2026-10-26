const mongoose = require('mongoose');

const foodConsumptionSchema = new mongoose.Schema({
  // معلومات أساسية
  recordDate: {
    type: Date,
    required: [true, 'تاريخ التسجيل مطلوب'],
    default: Date.now
  },
  poultryType: {
    type: String,
    required: [true, 'نوع الدواجن مطلوب'],
    enum: ['صيصان', 'دجاج لاحم', 'دجاج بياض'],
    default: 'دجاج لاحم'
  },
  batchNumber: {
    type: String,
    required: [true, 'رقم الدفعة مطلوب'],
    trim: true
  },
  
  // كمية الغذاء
  dailyConsumption: {
    type: Number,
    required: [true, 'الاستهلاك اليومي مطلوب'],
    min: 0,
    description: 'الكمية المستهلكة يومياً (كجم)'
  },
  weeklyConsumption: {
    type: Number,
    min: 0,
    description: 'الاستهلاك الأسبوعي (كجم)'
  },
  monthlyConsumption: {
    type: Number,
    min: 0,
    description: 'الاستهلاك الشهري (كجم)'
  },
  
  // عدد الطيور
  birdCount: {
    type: Number,
    required: [true, 'عدد الطيور مطلوب'],
    min: 0
  },
  averageAge: {
    type: Number,
    required: [true, 'متوسط العمر مطلوب'],
    min: 0,
    description: 'متوسط عمر الطيور (أيام)'
  },
  
  // نوع الغذاء
  feedType: {
    type: String,
    required: [true, 'نوع العلف مطلوب'],
    enum: ['بادئ', 'نامي', 'ناهي', 'بياض', 'خاص'],
    default: 'بادئ'
  },
  feedBrand: {
    type: String,
    trim: true,
    default: ''
  },
  
  // معدلات التحويل
  conversionRate: {
    type: Number,
    min: 0,
    description: 'معدل تحويل العلف (كجم علف / كجم لحم)'
  },
  feedCost: {
    type: Number,
    min: 0,
    description: 'تكلفة العلف لكل كجم'
  },
  
  // التوقعات المستقبلية
  expectedGrowth: {
    type: Number,
    min: 0,
    description: 'النمو المتوقع (%)'
  },
  futureDemand: {
    type: Number,
    min: 0,
    description: 'الطلب المستقبلي المتوقع (كجم)'
  },
  recommendedOrder: {
    type: Number,
    min: 0,
    description: 'كمية الطلب الموصى بها (كجم)'
  },
  
  // عوامل مؤثرة
  temperature: {
    type: Number,
    description: 'درجة الحرارة (مئوية)'
  },
  healthStatus: {
    type: String,
    enum: ['ممتاز', 'جيد', 'متوسط', 'ضعيف', 'حرج'],
    default: 'جيد'
  },
  
  // ملاحظات
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // حالة التسجيل
  status: {
    type: String,
    enum: ['مسجل', 'قيد المراجعة', 'معتمد'],
    default: 'مسجل'
  }
}, {
  timestamps: true
});

// دالة لحساب الاستهلاك الأسبوعي والشهري تلقائياً
foodConsumptionSchema.pre('save', function() {
  if (this.dailyConsumption) {
    this.weeklyConsumption = this.dailyConsumption * 7;
    this.monthlyConsumption = this.dailyConsumption * 30;
  }
  
  // حساب الطلب المستقبلي الموصى به
  if (this.dailyConsumption && this.expectedGrowth) {
    const growthFactor = 1 + (this.expectedGrowth / 100);
    this.futureDemand = this.dailyConsumption * 30 * growthFactor;
    this.recommendedOrder = this.futureDemand * 1.1; // إضافة 10% احتياطي
  }
  return;
});

// دالة للحصول على إحصائيات الاستهلاك
foodConsumptionSchema.statics.getConsumptionStats = async function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.recordDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$poultryType',
        totalDailyConsumption: { $sum: '$dailyConsumption' },
        avgDailyConsumption: { $avg: '$dailyConsumption' },
        totalBirdCount: { $sum: '$birdCount' },
        avgConversionRate: { $avg: '$conversionRate' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// دالة للتنبؤ بالاستهلاك المستقبلي
foodConsumptionSchema.statics.predictFutureConsumption = async function(days, poultryType) {
  const query = poultryType ? { poultryType } : {};
  const records = await this.find(query).sort({ recordDate: -1 }).limit(30);
  
  if (records.length === 0) return 0;
  
  const avgConsumption = records.reduce((sum, r) => sum + r.dailyConsumption, 0) / records.length;
  const growthRate = records.length > 1 ? 
    (records[0].dailyConsumption - records[records.length - 1].dailyConsumption) / records.length : 0;
  
  return avgConsumption * days + (growthRate * days);
};

module.exports = mongoose.model('FoodConsumption', foodConsumptionSchema);
