const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // The main information
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true, // to delete spaces in the start or end 
    maxlength: [50, 'الاسم لا يجب أن يتجاوز 50 حرفاً']
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true, // creating unique index on email in MongoDB
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صالح']
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف'],
    select: false // The password does not appear in any normal query.
  },


  companyName: {
    type: String,
    trim: true,
    maxlength: [100, 'اسم الشركة لا يجب أن يتجاوز 100 محرف']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [25, 'رقم الهاتف لا يجب أن يتجاوز 25 محرف']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'العنوان لا يجب أن يتجاوز 200 محرف']
  },


  // Permissions and Roles
  role: {
    type: String,
    enum: {
      values: ['admin', 'manager', 'employee', 'vet', 'food_supplier', 'fuel_supplier'],
      message: 'الدور المحدد غير صالح'
    },
    default: 'employee',
    required: true
  },


  permissions: {
    type: [String],
    default: function() {
      // Default permissions for each actor 
      const defaultPermissions = {
        admin: ['all'],
        manager: ['manage_operations', 'view_reports', 'create_orders', 'manage_resources'],
        employee: ['view_reports', 'create_orders'],
        vet: ['view_patients', 'manage_medical_records'],
        food_supplier: ['manage_food', 'update_inventory'],
        fuel_supplier: ['manage_fuel', 'update_deliveries']
      };
      return defaultPermissions[this.role] || [];
    }
  },


  // Fuel supplier availability Schedule
  availabilitySchedule: {
    type: mongoose.Schema.Types.Mixed, // Any type of data (Object, Array, ....)
    default: {
      sunday:    { enabled: true,  startTime: '08:00', endTime: '17:00' },
      monday:    { enabled: true,  startTime: '08:00', endTime: '17:00' },
      tuesday:   { enabled: true,  startTime: '08:00', endTime: '17:00' },
      wednesday: { enabled: true,  startTime: '08:00', endTime: '17:00' },
      thursday:  { enabled: true,  startTime: '08:00', endTime: '17:00' },
      friday:    { enabled: false, startTime: '08:00', endTime: '17:00' },
      saturday:  { enabled: false, startTime: '08:00', endTime: '17:00' },
    }
  },


  // Additional information
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// _________________________________________________________________________________________________

// Encrypt the password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    console.log('🔑 جارٍ تشفير كلمة المرور...');
    this.password = await bcrypt.hash(this.password, 12); // Number of times the password has been encrypted
    console.log('✅ تم التشفير بنجاح:', this.email);
    return;
  } catch (err) {
    console.error('❌ خطأ في التشفير:', err);
    throw err;
  }
});

// _________________________________________________________________________________________________

// Passwords comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Permission Check
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes('all') || this.permissions.includes(permission);
};

module.exports = mongoose.model('User', userSchema);