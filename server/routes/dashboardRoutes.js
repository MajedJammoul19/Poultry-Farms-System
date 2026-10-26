const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  updateDashboardData
} = require('../controllers/dashboardController');


router.put('/:title', updateDashboardData);

router.get('/', getDashboardData);

module.exports = router;