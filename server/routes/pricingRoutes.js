const express = require('express');
const router = express.Router();
const {
  getAllPrices,
  getPricesBySupplier,
  createPrice,
  updatePrice,
  deletePrice,
} = require('../controllers/pricingController');

router.get('/supplier/:supplierId', getPricesBySupplier);
router.get('/',    getAllPrices);
router.post('/',   createPrice);
router.put('/:id', updatePrice);
router.delete('/:id', deletePrice);

module.exports = router;
