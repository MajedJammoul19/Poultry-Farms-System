const mongoose = require('mongoose');

const fuelConsumptionSchema = new mongoose.Schema({
  // معلومات أساسية
  recordDate: {
    type: Date,
    required: [true, 'تاريخ التسجيل مطلوب'],
    default: Date.now
  },
  vehicleType: {
    type: String,
    required: [true, 'نوع المركبة مطلوب'],
    enum: ['شاحنة', 'حافلة', 'سيارة', 'جرار', 'مولد كهربائي', 'آلة زراعية', 'أخرى'],
    default: 'شاحنة'
  },
  vehicleNumber: {
    type: String,
    required: [true, 'رقم المركبة مطلوب'],
    trim: true,
    uppercase: true
  },
  driverName: {
    type: String,
    required: [true, 'اسم السائق مطلوب'],
    trim: true
  },
  
  // كمية الوقود
  fuelType: {
    type: String,
    required: [true, 'نوع الوقود مطلوب'],
    enum: ['بنزين 95', 'بنزين 98', 'ديزل', 'كاز', 'غاز'],
    default: 'ديزل'
  },
  fuelAmount: {
    type: Number,
    required: [true, 'كمية الوقود مطلوبة'],
    min: 0,
    description: 'كمية الوقود المستهلكة (لتر)'
  },
  fuelCost: {
    type: Number,
    required: [true, 'تكلفة الوقود مطلوبة'],
    min: 0,
    description: 'تكلفة الوقود (ريال/لتر)'
  },
  totalCost: {
    type: Number,
    min: 0,
    description: 'الإجمالي (ريال)'
  },
  
  // قراءات العداد
  startOdometer: {
    type: Number,
    min: 0,
    description: 'قراءة بداية العداد (كم)'
  },
  endOdometer: {
    type: Number,
    min: 0,
    description: 'قراءة نهاية العداد (كم)'
  },
  distanceTraveled: {
    type: Number,
    min: 0,
    description: 'المسافة المقطوعة (كم)'
  },
  
  // معدلات الاستهلاك
  consumptionRate: {
    type: Number,
    min: 0,
    description: 'معدل الاستهلاك (لتر/100 كم)'
  },
  efficiency: {
    type: Number,
    min: 0,
    description: 'الكفاءة (كم/لتر)'
  },
  
  // معلومات التشغيل
  operatingHours: {
    type: Number,
    min: 0,
    description: 'ساعات التشغيل (للمولدات والآلات)'
  },
  purpose: {
    type: String,
    required: [true, 'الغرض من الاستخدام مطلوب'],
    enum: ['نقل منتجات', 'توزيع', 'صيانة', 'تشغيل', 'نقل موظفين', 'أخرى'],
    default: 'نقل منتجات'
  },
  
  // معلومات إضافية
  refuelingStation: {
    type: String,
    trim: true,
    default: ''
  },
  invoiceNumber: {
    type: String,
    trim: true,
    default: ''
  },
  
  // الظروف والعوامل
  loadWeight: {
    type: Number,
    min: 0,
    description: 'وزن الحمولة (كجم)'
  },
  roadCondition: {
    type: String,
    enum: ['ممتاز', 'جيد', 'متوسط', 'سيئ', 'وعر'],
    default: 'جيد'
  },
  weatherCondition: {
    type: String,
    enum: ['مشمس', 'غائم', 'ممطر', 'عاصف', 'ضبابي'],
    default: 'مشمس'
  },
  
  // صيانة
  maintenanceNotes: {
    type: String,
    trim: true,
    default: ''
  },
  nextMaintenanceDue: {
    type: Number,
    description: 'الصيانة القادمة بعد (كم)'
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

// دالة لحساب الإجماليات تلقائياً
fuelConsumptionSchema.pre('save', function() {
  // حساب التكلفة الإجمالية
  if (this.fuelAmount && this.fuelCost) {
    this.totalCost = this.fuelAmount * this.fuelCost;
  }
  
  // حساب المسافة المقطوعة
  if (this.startOdometer && this.endOdometer && this.endOdometer > this.startOdometer) {
    this.distanceTraveled = this.endOdometer - this.startOdometer;
    
    // حساب معدل الاستهلاك (لتر/100 كم)
    if (this.fuelAmount && this.distanceTraveled > 0) {
      this.consumptionRate = (this.fuelAmount / this.distanceTraveled) * 100;
      this.efficiency = this.distanceTraveled / this.fuelAmount;
    }
  }
  
  // حساب الصيانة القادمة
  if (this.endOdometer && this.nextMaintenanceDue) {
    this.nextMaintenanceDue = this.endOdometer + 5000; // كل 5000 كم
  }
  
  return;
});

// دالة للحصول على إحصائيات الاستهلاك
fuelConsumptionSchema.statics.getConsumptionStats = async function(startDate, endDate) {
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
        _id: '$vehicleType',
        totalFuel: { $sum: '$fuelAmount' },
        totalCost: { $sum: '$totalCost' },
        avgConsumptionRate: { $avg: '$consumptionRate' },
        avgEfficiency: { $avg: '$efficiency' },
        totalDistance: { $sum: '$distanceTraveled' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// دالة للتنبؤ بالاستهلاك المستقبلي
fuelConsumptionSchema.statics.predictFutureConsumption = async function(days, vehicleType) {
  const query = vehicleType ? { vehicleType } : {};
  const records = await this.find(query).sort({ recordDate: -1 }).limit(30);
  
  if (records.length === 0) return 0;
  
  const avgFuel = records.reduce((sum, r) => sum + r.fuelAmount, 0) / records.length;
  const avgCost = records.reduce((sum, r) => sum + r.totalCost, 0) / records.length;
  
  const dailyAvg = avgFuel / 30; // تقريباً
  const monthlyAvg = dailyAvg * 30;
  
  return {
    daily: Math.round(dailyAvg),
    weekly: Math.round(dailyAvg * 7),
    monthly: Math.round(monthlyAvg),
    quarterly: Math.round(monthlyAvg * 3),
    estimatedCost: Math.round((monthlyAvg / avgFuel) * avgCost) || 0
  };
};

module.exports = mongoose.model('FuelConsumption', fuelConsumptionSchema);
