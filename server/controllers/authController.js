const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // validate inputs


// build response for User ("Without password")
const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  companyName: user.companyName || '',
  phone: user.phone || '',
  address: user.address || '',
  permissions: user.permissions,
  lastLogin: user.lastLogin
});

// _________________________________________________________________________________________________

// Improved User's Signup 
exports.signup = async (req, res) => {
  console.log('📤 البيانات الواردة:', req.body);
  try {
    const { name, email, password, role, companyName, phone, address } = req.body;
    console.log(name)
    // 1. Data's Check
    console.log('📩 بيانات الواردة:', { name, email, role });

    // 2. Saving user
    const user = new User({ name, email, password, role, companyName, phone, address });
    await user.save();
    console.log('💾 تم الحفظ:', user);

    // 3. Sending response in the right way
    res.status(201).json({  // 201 : Created 
      success: true,
      data: buildUserResponse(user)
    });

  } catch (err) {
    console.error('❌ خطأ:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      fullError: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
};

// _________________________________________________________________________________________________

// Improved User's Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() // Transform errors to Array to Sending it to frontend
      });
    }

    const { email, password } = req.body;

    // Improving search with characters processing
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password +lastLogin');


    if (!user) {
      return res.status(401).json({ // 401 : Validation error      400 : Inputs error   
        success: false,
        message: 'هذا البريد الإلكتروني غير مسجل في النظام',
        errorCode: 'EMAIL_NOT_FOUND'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة',
        errorCode: 'WRONG_PASSWORD'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'تم تجميد هذا الحساب من قبل الإدارة. يرجى الانتظار حتى يقوم الأدمن بتفعيله مرة أخرى',
        errorCode: 'ACCOUNT_FROZEN'
      });
    }


    // Update Last login
    user.lastLogin = Date.now();
    await user.save();



    // Create Token
   const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000) // Issued At : Added to manage Time
  },
  process.env.JWT_SECRET,
  { 
    expiresIn: '30d', // The token is valid for 30 days.
    algorithm: 'HS256' //It uses a single key for signing and verification.
  }
);

    res.json({
      success: true,
      token,
      user: buildUserResponse(user)
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في السيرفر',
      error: err.message,
      errorDetails: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// _________________________________________________________________________________________________


// Updating the profile of a food or fuel supplier
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const allowedRoles = ['food_supplier', 'fuel_supplier'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'تحديث هذا الملف متاح لتاجر المواد الغذائية أو تاجر الوقود فقط'
      });
    }

    const allowedFields = ['name', 'email', 'companyName', 'phone', 'address'];
    const updates = {};

    allowedFields.forEach((field) => {
      // hasOwnProperty : It checks if the same key exists in the object, regardless of its value.
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    });

    if (!updates.name) {
      return res.status(400).json({
        success: false,
        message: 'اسم التاجر مطلوب'
      });
    }

    if (!updates.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صالح'
      });
    }

    if (updates.phone && !/^[\d\s()+-]{6,25}$/.test(updates.phone)) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهاتف غير صالح'
      });
    }


    // Email Uniqueness Verification
    const emailOwner = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: user._id }
    });

    if (emailOwner) {
      // 409 : Data discrepancies
      return res.status(409).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم من حساب آخر'
      });
    }

    // Applying updates
    Object.assign(user, updates);
    await user.save();

    res.status(200).json({
      success: true,
      user: buildUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'تعذر تحديث الملف الشخصي',
      error: error.message
    });
  }
};

// _________________________________________________________________________________________________


exports.getFuelSuppliersAvailability = async (req, res) => {
  try {
    const suppliers = await User.find({ role: 'fuel_supplier', isActive: true })
      .select('name companyName phone availabilitySchedule')
      .lean(); // It does not contain getters/setters , Suitable for reading only

    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    res.json({ success: true, data: user.availabilitySchedule || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    if (user.role !== 'fuel_supplier') {
      return res.status(403).json({ success: false, message: 'هذه الميزة متاحة لتاجر الوقود فقط' });
    }

    const { schedule } = req.body;
    if (!schedule || typeof schedule !== 'object') {
      return res.status(400).json({ success: false, message: 'بيانات الجدول غير صالحة' });
    }

    user.availabilitySchedule = schedule;
    user.markModified('availabilitySchedule');
    await user.save();

    res.json({ success: true, data: user.availabilitySchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// _________________________________________________________________________________________________

exports.getRecentLogins = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    // Retrieve all active users with a lastLogin, or if none exists, all users
    let recentUsers = await User.find({ lastLogin: { $ne: null } }) // Excludes users who have never logged in
      .sort({ lastLogin: -1 }) // Newest First
      .limit(limit)
      .select('name role lastLogin')
      .lean();
    

    // If there are no users with lastLogin, fetch all active users.
    if (recentUsers.length === 0) {
      recentUsers = await User.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name role lastLogin')
        .lean();
    }

    res.status(200).json({
      success: true,
      data: recentUsers.map(user => ({
        id: user._id,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    console.error('Recent Logins Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أحدث تسجيلات الدخول',
      error: error.message
    });
  }
};


// Retrieve current user data
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'الحساب غير موجود أو غير نشط' });
    }
    res.json({ success: true, user: buildUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: users.length,
      data: users.map(u => ({
        id:          u._id,
        name:        u.name,
        email:       u.email,
        role:        u.role,
        companyName: u.companyName || '',
        phone:       u.phone || '',
        isActive:    u.isActive,
        lastLogin:   u.lastLogin,
        createdAt:   u.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




// _______________________________________________________________________________________________
//                      UPDATE AND DELETE USERS BY ADMIN
// _______________________________________________________________________________________________

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const updates = {};
    if (role     !== undefined) updates.role     = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetUserPasswordByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
      });
    }

    // Loaded via findById + save() (not findByIdAndUpdate) so the same
    // password-hashing pre('save') hook used at signup runs here too.
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(id) === String(req.userId)) {
      return res.status(400).json({ success: false, message: 'لا يمكنك حذف حسابك الخاص' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};