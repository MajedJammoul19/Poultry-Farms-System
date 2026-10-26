const express = require('express');
const router = express.Router();
const foodOrderController = require('../controllers/foodOrderController');

router.post('/api/food-orders', foodOrderController.createOrder);
router.get('/api/food-orders', foodOrderController.getAllOrders);
router.put('/api/food-orders/threshold', foodOrderController.updateThreshold);
router.get('/api/food-orders/inventory', foodOrderController.getInventory);

module.exports = router;