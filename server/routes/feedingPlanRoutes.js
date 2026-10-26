const express = require('express');
const router = express.Router();
const {
  createFeedingPlan,
  getAllFeedingPlans,
  getFeedingPlanById,
  updateFeedingPlan,
  deleteFeedingPlan,
  getPlansByPoultryType,
  searchFeedingPlans
} = require('../controllers/feedingPlanController');

// مسارات البحث (يجب أن تأتي قبل مسارات المعرّف)
router.get('/search/:keyword', searchFeedingPlans);
router.get('/poultry/:type', getPlansByPoultryType);

// مسارات CRUD الأساسية
router.route('/')
  .post(createFeedingPlan)
  .get(getAllFeedingPlans);

router.route('/:id')
  .get(getFeedingPlanById)
  .put(updateFeedingPlan)
  .delete(deleteFeedingPlan);

module.exports = router;