
// Simple role gate that works with the project's existing authMiddleware,
// which sets req.userRole (not req.user.role). Use alongside authMiddleware:
//   router.post('/', authMiddleware, allowRoles('Veterinarian', 'Employee'), handler)
//
// NOTE: match the exact casing your User model actually stores for `role`
// (e.g. "Veterinarian" vs "veterinarian") - a mismatch here is what caused
// the earlier 403.
exports.allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: 'غير مسموح لك بالوصول لهذه الصفحة',
    });
  }
  next();
};