const express = require('express');
const router = express.Router();
const medicalExaminationController = require('../controllers/medicalExaminationController');
const { validateExaminationInput } = require('../middleware/medicalExaminationMiddleware');

// إنشاء فحص طبي جديد - مع التحقق من صحة البيانات
router.post('/api/medical-examinations', validateExaminationInput, medicalExaminationController.createExamination);

// جلب جميع الفحوصات الطبية
router.get('/api/medical-examinations', medicalExaminationController.getExaminations);

// جلب فحص طبي واحد
router.get('/api/medical-examinations/:id', medicalExaminationController.getExamination);

// تحديث فحص طبي - مع التحقق من صحة البيانات
router.put('/api/medical-examinations/:id', validateExaminationInput, medicalExaminationController.updateExamination);

// حذف فحص طبي
router.delete('/api/medical-examinations/:id', medicalExaminationController.deleteExamination);

module.exports = router;