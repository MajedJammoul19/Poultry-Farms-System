const express = require('express');
const router = express.Router();
const {
  createConsumption,
  getAllConsumptions,
  getConsumptionById,
  updateConsumption,
  deleteConsumption,
  predictFutureConsumption,
  getConsumptionStats
} = require('../controllers/foodConsumptionController');

// مسارات خاصة (يجب أن تأتي قبل مسارات المعرّف)
router.get('/predict/future', predictFutureConsumption);
router.get('/stats/summary', getConsumptionStats);

// مسارات CRUD الأساسية
router.route('/')
  .post(createConsumption)
  .get(getAllConsumptions);

router.route('/:id')
  .get(getConsumptionById)
  .put(updateConsumption)
  .delete(deleteConsumption);

module.exports = router;