const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    maxlength: [100, 'لا يمكن أن يتجاوز الاسم 100 حرف']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'الرجاء إدخال بريد إلكتروني صحيح']
  },
  foodType: {
    type: String,
    required: [true, 'نوع الطعام مطلوب'],
    enum: {
      values: ['علف للدواجن', 'حبوب', 'مكملات غذائية'],
      message: 'نوع الطعام يجب أن يكون واحدًا من: علف للدواجن، حبوب، مكملات غذائية'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'الكمية مطلوبة'],
    min: [1, 'الكمية يجب أن تكون على الأقل 1'],
    max: [1000, 'الكمية القصوى المسموح بها هي 1000']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'لا يمكن أن تتجاوز الملاحظات 500 حرف']
  },

  // Inventory Management
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);