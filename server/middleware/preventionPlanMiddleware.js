const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware لحماية المسارات بالمصادقة
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // التحقق من وجود token في headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // استخراج token من header
      token = req.headers.authorization.split(' ')[1];
      
      // التحقق من token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // إضافة بيانات المستخدم إلى request
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('خطأ في المصادقة:', error);
      res.status(401);
      throw new Error('غير مصرح بالوصول، token غير صالح');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('غير مصرح بالوصول، لا يوجد token');
  }
});

// Middleware للصلاحيات (للمشرفين والأطباء البيطريين)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`صلاحية ${req.user.role} غير مخولة للوصول لهذه الوظيفة`);
    }
    next();
  };
};

// Middleware للتحقق من ملكية الخطة
exports.checkOwnership = asyncHandler(async (req, res, next) => {
  const plan = await PreventionPlan.findById(req.params.id);
  
  if (!plan) {
    res.status(404);
    throw new Error('خطة الوقاية غير موجودة');
  }

  // التحقق إذا كان المستخدم هو المنشئ أو مشرف
  if (plan.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('غير مصرح بالتعديل على هذه الخطة');
  }

  next();
});