// تحقق من صحة بيانات البلاغ
exports.validateReport = (req, res, next) => {
  const errors = {};
  const { facilityName, location, cleanlinessRating } = req.body;

  if (!facilityName) errors.facilityName = 'اسم المنشأة مطلوب';
  if (!location) errors.location = 'الموقع مطلوب';
  if (!cleanlinessRating || cleanlinessRating < 1 || cleanlinessRating > 5) {
    errors.cleanlinessRating = 'التقييم يجب أن يكون بين 1 و 5';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'تحقق من البيانات المدخلة',
      errors
    });
  }

  next();
};

