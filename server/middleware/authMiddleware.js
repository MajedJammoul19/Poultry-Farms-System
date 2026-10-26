const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
  try {
    // Token extraction from the order header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'يجب توفير توكن المصادقة'
      });
    }

    // Token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'تم تجميد هذا الحساب من قبل الإدارة. يرجى الانتظار حتى يقوم الأدمن بتفعيله مرة أخرى',
        errorCode: 'ACCOUNT_FROZEN'
      });
    }

    // Add user data to the request 
    req.userId = user._id;
    req.userRole = user.role;
    next();  // ✅ تأكد من وجود next() هنا

  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'جلسة الدخول غير صالحة',
      error: err.message
    });
  }
};

// _________________________________________________________________________________________________

// Middleware for verifying permissions
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          message: 'غير مسموح لك بالوصول لهذه الصفحة'
        });
      }
      
      next();  // ✅ تأكد من وجود next() هنا
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في التحقق من الصلاحيات'
      });
    }
  };
};