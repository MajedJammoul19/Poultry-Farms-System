const express = require('express');
const router = express.Router();
const {
  createRecommendation,
  getAllRecommendations,
  getRecommendationById,
  updateRecommendation,
  updateRecommendationStatus,
  deleteRecommendation,
  getRecommendationsStats
} = require('../controllers/managerRecommendationController');

// جميع المسارات عامة (بدون مصادقة)
// فقط عمليات التعديل والحذف تتطلب رمز سري

// مسارات الإحصائيات
router.get('/stats/summary', getRecommendationsStats);

// مسارات CRUD الأساسية
router.route('/')
  .post(createRecommendation)  // عام -任何人都可以发送
  .get(getAllRecommendations); // عام -任何人都可以查看

router.route('/:id')
  .get(getRecommendationById)  // عام -任何人都可以查看
  .put(updateRecommendation)    // يتطلب رمز سري
  .delete(deleteRecommendation); // يتطلب رمز سري

// مسار تحديث الحالة (يتطلب رمز سري)
router.patch('/:id/status', updateRecommendationStatus);

module.exports = router;