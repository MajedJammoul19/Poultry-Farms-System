const express = require('express');
const router = express.Router();
const fuelOrderController = require('../controllers/fuelOrderController');

router.post('/api/fuel-orders', fuelOrderController.createFuelOrder);
router.get('/api/fuel-orders', fuelOrderController.getAllFuelOrders);
router.put('/api/fuel-orders/threshold', fuelOrderController.updateThreshold);
router.get('/api/fuel-orders/inventory', fuelOrderController.getInventory);

module.exports = router;