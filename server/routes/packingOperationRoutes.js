const express = require('express');
const router = express.Router();
const {
  createPackingOperation,
  getAllOperations,
  getOperationById,
  updateOperation,
  deleteOperation,
  getOperationsStats
} = require('../controllers/packingOperationController');

// مسارات الإحصائيات
router.get('/stats/summary', getOperationsStats);

// مسارات CRUD الأساسية
router.route('/')
  .post(createPackingOperation)
  .get(getAllOperations);

router.route('/:id')
  .get(getOperationById)
  .put(updateOperation)
  .delete(deleteOperation);

module.exports = router;