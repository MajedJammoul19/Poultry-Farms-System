const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب'],
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
      },
      index: true,
    },
    checkInTime: {
      type: Date,
      required: [true, 'وقت تسجيل الحضور مطلوب'],
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out'],
      default: 'checked-in',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    deviceInfo: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// فهرس غير فريد — يسمح بجلسات متعددة في اليوم الواحد
attendanceSchema.index({ userId: 1, date: 1 });

attendanceSchema.pre('save', async function () {
  if (this.checkOutTime && this.checkInTime) {
    // نحفظ الفرق بالميلي ثانية كرقم دقيق بدون تقريب
    this.totalHours = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
  }
});

attendanceSchema.methods.calculateTotalHours = function () {
  if (this.checkOutTime && this.checkInTime) {
    this.totalHours = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
    return this.totalHours;
  }
  return 0;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

// إزالة صامتة لفهرس فريد قديم قد يكون موجوداً من إصدار سابق من السكيمة
// (بدون أي رسالة في الطرفية — لا يؤثر إن لم يكن الفهرس موجوداً)
mongoose.connection.once('open', () => {
  Attendance.collection.dropIndex('userId_1_date_1').catch(() => {});
});

module.exports = Attendance;
