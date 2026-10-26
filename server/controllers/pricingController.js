const Pricing = require('../models/Pricing');

exports.getAllPrices = async (req, res) => {
  try {
    const prices = await Pricing.find().sort({ createdAt: -1 });
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPricesBySupplier = async (req, res) => {
  try {
    const prices = await Pricing.find({ supplierId: req.params.supplierId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPrice = async (req, res) => {
  try {
    const newPrice = new Pricing(req.body);
    const saved = await newPrice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePrice = async (req, res) => {
  try {
    await Pricing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const updated = await Pricing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
