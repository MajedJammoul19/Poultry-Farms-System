// تحقق من صحة بيانات طلب الوقود
exports.validateFuelOrder = (req, res, next) => {
  const errors = {};
  const { facilityName, ownerName, contactNumber, fuelType, quantity, deliveryDate } = req.body;

  if (!facilityName) errors.facilityName = 'اسم المنشأة مطلوب';
  if (!ownerName) errors.ownerName = 'اسم المالك مطلوب';
  if (!contactNumber) errors.contactNumber = 'رقم الاتصال مطلوب';
  if (!fuelType) errors.fuelType = 'نوع الوقود مطلوب';
  if (!quantity || quantity <= 0) errors.quantity = 'الكمية يجب أن تكون أكبر من الصفر';
  if (!deliveryDate || new Date(deliveryDate) < new Date()) errors.deliveryDate = 'يجب تحديد تاريخ توصيل صحيح';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'تحقق من البيانات المدخلة',
      errors
    });
  }

  next();
};

// تحقق من صلاحيات المستخدم (مثال)
exports.checkAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح بالوصول، يرجى تسجيل الدخول'
    });
  }
  next();
};