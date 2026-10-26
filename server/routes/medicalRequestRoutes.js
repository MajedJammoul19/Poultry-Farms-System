const express = require('express');
const router = express.Router();
const {
  createMedicalRequest,
  getAllMedicalRequests,
  getMedicalRequestById,
  updateMedicalRequest,
  deleteMedicalRequest,
  updateRequestStatus,
  getRequestStats,
  searchMedicalRequests
} = require('../controllers/medicalRequestController');

// مسارات خاصة (يجب أن تأتي قبل مسارات المعرّف)
router.get('/stats/summary', getRequestStats);
router.get('/search/:keyword', searchMedicalRequests);

// مسارات CRUD الأساسية
router.route('/')
  .post(createMedicalRequest)
  .get(getAllMedicalRequests);

router.route('/:id')
  .get(getMedicalRequestById)
  .put(updateMedicalRequest)
  .delete(deleteMedicalRequest);

// مسار تحديث الحالة
router.patch('/:id/status', updateRequestStatus);

module.exports = router;