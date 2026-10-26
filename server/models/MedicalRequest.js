const mongoose = require('mongoose');

const medicalRequestSchema = new mongoose.Schema({
  // معلومات أساسية
  requestNumber: {
    type: String,
    unique: true,
  },
  requestDate: {
    type: Date,
    required: [true, 'تاريخ الطلب مطلوب'],
    default: Date.now
  },
  facilityName: {
    type: String,
    required: [true, 'اسم المنشأة مطلوب'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'اسم المالك مطلوب'],
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'رقم الاتصال مطلوب'],
    trim: true
  },
  
  // معلومات الدواجن
  poultryType: {
    type: String,
    required: [true, 'نوع الدواجن مطلوب'],
    enum: ['دجاج لاحم', 'دجاج بياض', 'بط', 'حمام', 'سمان', 'ديك رومي', 'أخرى'],
    default: 'دجاج لاحم'
  },
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
  affectedCount: {
    type: Number,
    min: 0,
    default: 0,
    description: 'عدد الطيور المصابة'
  },
  mortalityCount: {
    type: Number,
    min: 0,
    default: 0,
    description: 'عدد النافق'
  },
  
  // الأعراض والعلامات
  symptoms: {
    type: String,
    required: [true, 'الأعراض مطلوبة'],
    trim: true
  },
  symptomsStartDate: {
    type: Date,
    required: [true, 'تاريخ بدء الأعراض مطلوب']
  },
  clinicalSigns: {
    type: String,
    trim: true,
    description: 'العلامات السريرية'
  },
  
  // التشخيص
  diagnosis: {
    type: String,
    trim: true,
    default: ''
  },
  diagnosisDate: {
    type: Date
  },
  
  // العلاج المطلوب
  treatmentType: {
    type: String,
    required: [true, 'نوع العلاج مطلوب'],
    enum: ['مضاد حيوي', 'فيتامينات', 'لقاح', 'مضاد طفيليات', 'مطهر', 'أخرى'],
    default: 'مضاد حيوي'
  },
  medicationName: {
    type: String,
    required: [true, 'اسم الدواء مطلوب'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'الجرعة مطلوبة'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'مدة العلاج مطلوبة'],
    trim: true
  },
  administrationMethod: {
    type: String,
    enum: ['عن طريق العلف', 'عن طريق الماء', 'حقن', 'رش', 'قطرة', 'أخرى'],
    default: 'عن طريق الماء'
  },
  
  // معلومات إضافية
  vetName: {
    type: String,
    trim: true,
    default: ''
  },
  vetLicense: {
    type: String,
    trim: true,
    default: ''
  },
  previousTreatments: {
    type: String,
    trim: true,
    default: '',
    description: 'العلاجات السابقة'
  },
  labResults: {
    type: String,
    trim: true,
    default: '',
    description: 'نتائج التحاليل المخبرية'
  },
  
  // حالة الطلب
  priority: {
    type: String,
    enum: ['عاجل', 'مرتفع', 'متوسط', 'منخفض'],
    default: 'متوسط'
  },
  status: {
    type: String,
    enum: ['قيد المراجعة', 'قيد المعالجة', 'تم الموافقة', 'مرفوض', 'مكتمل'],
    default: 'قيد المراجعة'
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: ''
  },
  
  // ملاحظات
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // معلومات المستخدم (اختياري)
  requesterName: {
    type: String,
    trim: true,
    default: ''
  },
  requesterEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  }
}, {
  timestamps: true
});

// إنشاء رقم طلب تلقائي قبل الحفظ
medicalRequestSchema.pre('save', async function() {
  if (!this.requestNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments();
    this.requestNumber = `MR-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  return;
});

// إضافة فهارس للبحث
medicalRequestSchema.index({ requestNumber: 1 });
medicalRequestSchema.index({ facilityName: 1, requestDate: -1 });
medicalRequestSchema.index({ status: 1, priority: 1 });

// دالة للحصول على إحصائيات الطلبات
medicalRequestSchema.statics.getRequestStats = async function(startDate, endDate) {
  const match = {};
  if (startDate && endDate) {
    match.requestDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBirds: { $sum: '$birdCount' },
        totalAffected: { $sum: '$affectedCount' },
        totalMortality: { $sum: '$mortalityCount' }
      }
    }
  ]);
};

// دالة للحصول على الطلبات العاجلة
medicalRequestSchema.statics.getUrgentRequests = function() {
  return this.find({ priority: 'عاجل', status: { $ne: 'مكتمل' } })
    .sort({ requestDate: 1 });
};

module.exports = mongoose.model('MedicalRequest', medicalRequestSchema);
