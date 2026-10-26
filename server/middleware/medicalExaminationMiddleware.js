const MedicalExamination = require('../models/MedicalExamination');
const asyncHandler = require('express-async-handler');

// التحقق من ملكية التقرير الطبي
exports.checkExaminationOwnership = asyncHandler(async (req, res, next) => {
  const examination = await MedicalExamination.findById(req.params.id);
  
  if (!examination) {
    res.status(404);
    throw new Error('تقرير الفحص الطبي غير موجود');
  }

  // التحقق إذا كان المستخدم هو المنشئ أو مشرف
  if (examination.createdBy && examination.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('غير مصرح بالتعديل على هذا التقرير');
  }

  req.examination = examination;
  next();
});

// التحقق من صحة بيانات الفحص الطبي
exports.validateExaminationInput = asyncHandler(async (req, res, next) => {
  const { vetName, location, chickenCount, healthStatus, dailyMortalityCount } = req.body;

  console.log('🔍 middleware - التحقق من البيانات:', { vetName, location, chickenCount, healthStatus, dailyMortalityCount });

  // التحقق من وجود الحقول الأساسية
  if (!vetName || !location || !chickenCount || !healthStatus) {
    res.status(400);
    throw new Error('البيانات الأساسية ناقصة (اسم الطبيب، الموقع، عدد الدجاج، الحالة الصحية)');
  }

  // التحقق من وجود dailyMortalityCount
  if (dailyMortalityCount === undefined || dailyMortalityCount === null || dailyMortalityCount === '') {
    res.status(400);
    throw new Error('عدد حالات النفوق اليومية مطلوب');
  }

  // التحقق من صحة عدد الدجاج
  const parsedChickenCount = parseInt(chickenCount);
  if (isNaN(parsedChickenCount) || parsedChickenCount < 1) {
    res.status(400);
    throw new Error('عدد الدجاج يجب أن يكون رقمًا أكبر من الصفر');
  }

  // التحقق من صحة عدد النفوق
  const parsedMortalityCount = parseInt(dailyMortalityCount);
  if (isNaN(parsedMortalityCount)) {
    res.status(400);
    throw new Error('عدد حالات النفوق اليومية يجب أن يكون رقماً صحيحاً');
  }
  
  if (parsedMortalityCount < 0) {
    res.status(400);
    throw new Error('عدد حالات النفوق اليومية لا يمكن أن يكون سالباً');
  }

  // التحقق من الحالة الصحية (دعم كل القيم الممكنة)
  const validHealthStatuses = ['صحي', 'غير صحي', 'ممتاز', 'جيد', 'متوسط', 'ضعيف', 'حرج'];
  if (!validHealthStatuses.includes(healthStatus)) {
    res.status(400);
    throw new Error('الحالة الصحية يجب أن تكون إحدى القيم: صحي، غير صحي، ممتاز، جيد، متوسط، ضعيف، حرج');
  }

  // إضافة البيانات المحولة إلى req.body
  req.body.chickenCount = parsedChickenCount;
  req.body.dailyMortalityCount = parsedMortalityCount;
  
  console.log('✅ middleware - تم التحقق بنجاح، القيم المحولة:', { chickenCount: parsedChickenCount, dailyMortalityCount: parsedMortalityCount });
  
  next();
});

// التحقق من صلاحية الطبيب البيطري
exports.authorizeVet = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role !== 'vet' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('ليست لديك صلاحية طبيب بيطري');
  }
  next();
});

// تسجيل عمليات الفحص الطبي
exports.logExaminationAction = (actionType) => {
  return asyncHandler(async (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${actionType} - User: ${req.user?.id || 'unknown'}, Examination: ${req.params.id || 'new'}`);
    next();
  });
};