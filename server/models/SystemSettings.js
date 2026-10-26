const mongoose = require('mongoose');

// إعدادات النظام مستند واحد فقط (singleton) يخزّن أقسام صفحة "إعدادات النظام"
// بشكل مرن (Mixed) لأن كل قسم يحتوي عنوان وأيقونة وقائمة عناصر (تسمية/قيمة)
const systemSettingsSchema = new mongoose.Schema({
  sections: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
