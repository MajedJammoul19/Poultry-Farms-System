const mongoose = require('mongoose');

const normalizePhoneNumber = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // أرقام عربية هندية
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0)) // أرقام فارسية/أردية
    .replace(/[\s\-()]/g, '');
};

const fuelOrderSchema = new mongoose.Schema({
  facilityName: {
    type: String,
    required: [true, 'اسم المنشأة مطلوب'],
    trim: true,
    maxlength: [150, 'لا يمكن أن يتجاوز اسم المنشأة 150 حرف']
  },
  ownerName: {
    type: String,
    required: [true, 'اسم المالك مطلوب'],
    trim: true,
    maxlength: [100, 'لا يمكن أن يتجاوز اسم المالك 100 حرف']
  },
  contactNumber: {
    type: String,
    required: [true, 'رقم الاتصال مطلوب'],
    trim: true,
    set: normalizePhoneNumber,
    match: [/^\+?[0-9]{8,15}$/, 'الرجاء إدخال رقم هاتف صحيح']
  },
  fuelType: {
    type: String,
    required: [true, 'نوع الوقود مطلوب'],
    enum: {
      values: ['ديزل', 'غاز طبيعي'],
      message: 'نوع الوقود يجب أن يكون واحدًا من: ديزل، غاز طبيعي'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية المطلوبة مطلوبة'],
    min: [1, 'الكمية يجب أن تكون على الأقل 1 لتر'],
    max: [100000, 'الكمية القصوى المسموح بها هي 100,000 لتر']
  },
  deliveryDate: {
    type: Date,
    required: [true, 'تاريخ التوصيل مطلوب'],
    validate: {
      validator: function (value) {
        if (!value) return false;
        const todayDate = new Date().toISOString().slice(0, 10);
        const deliveryDateOnly = new Date(value).toISOString().slice(0, 10);
        return deliveryDateOnly >= todayDate;
      },
      message: 'لا يمكن اختيار تاريخ قديم'
    }
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0,
    description: 'الكمية الحالية في المخزون'
  },
  threshold: {
    type: Number,
    default: null,
    min: 0,
    description: 'الحد الأدنى للتنبيه'
  },
  status: {
    type: String,
    enum: ['قيد المعالجة', 'تم التسليم', 'ملغي'],
    default: 'قيد المعالجة'
  },
  paymentStatus: {
    type: String,
    enum: ['معلقة', 'مدفوعة', 'مستلمة'],
    default: 'معلقة'
  },
  pricePerLiter: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: null
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

fuelOrderSchema.pre('save', function() {
  console.log(`تم إنشاء طلب وقود جديد للمنشأة: ${this.facilityName}`);
  return;
});

const FuelOrder = mongoose.model('FuelOrder', fuelOrderSchema);

module.exports = FuelOrder;