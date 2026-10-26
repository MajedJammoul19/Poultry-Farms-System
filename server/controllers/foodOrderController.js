const FoodOrder = require("../models/FoodOrder");
const { createLowStockAlert } = require('./alertsController');

exports.createOrder = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const order = new FoodOrder(req.body);
    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder);
    const foundOrder = await FoodOrder.findById(savedOrder._id);
    console.log('Found in DB:', foundOrder);
    res.status(201).json({
      success: true,
      data: savedOrder
    });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.find().sort({ date: -1 });
    const reports = orders.map(order => ({
      date: order.date,
      feedType: order.feedType,
      quantity: `${order.quantity} كجم`
    }));
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

exports.updateThreshold = async (req, res) => {
  try {
    const { foodType, threshold } = req.body;
    if (!foodType || threshold === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد نوع العلف والحد الأدنى'
      });
    }

    let order = await FoodOrder.findOne({ foodType });
    if (!order) {
      order = new FoodOrder({
        name: 'مدير المنشأة',
        email: 'admin@farm.com',
        foodType,
        quantity: 0,
        notes: 'تم إنشاء السجل تلقائياً للمخزون',
        currentStock: 0,
        threshold: 0
      });
    }

    order.threshold = threshold;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الحد الأدنى بنجاح',
      data: { foodType, threshold }
    });
  } catch (err) {
    console.error('Error updating threshold:', err);
    res.status(500).json({
      success: false,
      message: 'فشل تحديث الحد الأدنى',
      error: err.message
    });
  }
};

exports.decreaseStock = async (foodType, consumedQuantity) => {
  try {
    const order = await FoodOrder.findOne({ foodType });
    if (!order) {
      console.warn(`لا يوجد سجل مخزون لنوع العلف: ${foodType}`);
      return { success: false, message: 'نوع العلف غير موجود' };
    }

    order.currentStock = Math.max(0, (order.currentStock || 0) - consumedQuantity);
    await order.save();

    if (order.threshold !== null && order.currentStock <= order.threshold) {
      await createLowStockAlert({
        itemName: `علف ${foodType}`,
        itemType: 'food',
        currentStock: order.currentStock,
        threshold: order.threshold,
        category: 'food',
        targetRole: 'admin'
      });
    }

    return { success: true, data: order };
  } catch (err) {
    console.error('Error decreasing stock:', err);
    return { success: false, message: err.message };
  }
};

exports.getInventory = async (req, res) => {
  try {
    const orders = await FoodOrder.find({}, 'foodType currentStock threshold');
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب بيانات المخزون'
    });
  }
};