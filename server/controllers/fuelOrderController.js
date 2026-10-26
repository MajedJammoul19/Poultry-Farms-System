const FuelOrder = require('../models/FuelOrder');
const { createLowStockAlert } = require('./alertsController');

exports.createFuelOrder = async (req, res) => {
  try {
    const orderData = { ...req.body };
    if (req.userRole === 'fuel_supplier') {
      orderData.supplierId = req.userId;
    } else if (req.userRole === 'manager' && req.body.supplierId) {
      orderData.supplierId = req.body.supplierId;
    }
    const fuelOrder = await FuelOrder.create(orderData);
    res.status(201).json({
      success: true,
      message: 'تم إنشاء طلب الوقود بنجاح',
      data: fuelOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'فشل في إنشاء طلب الوقود',
      error: error.message,
      validationErrors: error.errors || null
    });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const query = {
      status: 'تم التسليم',
      paymentStatus: { $in: ['مدفوعة', 'مستلمة'] }
    };

    if (req.userId) query.supplierId = req.userId;

    const invoices = await FuelOrder.find(query).sort({ paymentDate: -1, createdAt: -1 });

    const totalQuantity = invoices.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
    const totalAmount   = invoices.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0);

    res.status(200).json({
      success: true,
      count: invoices.length,
      totalQuantity,
      totalAmount,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الفواتير',
      error: error.message
    });
  }
};

exports.getAllFuelOrders = async (req, res) => {
  try {
    const fuelOrders = await FuelOrder.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: fuelOrders.length,
      data: fuelOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل في جلب طلبات الوقود',
      error: error.message
    });
  }
};

exports.getFuelOrderById = async (req, res) => {
  try {
    const fuelOrder = await FuelOrder.findById(req.params.id);
    if (!fuelOrder) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على طلب الوقود'
      });
    }
    res.status(200).json({
      success: true,
      data: fuelOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل في جلب طلب الوقود',
      error: error.message
    });
  }
};

exports.updateFuelOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const fuelOrder = await FuelOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!fuelOrder) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على طلب الوقود'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة طلب الوقود',
      data: fuelOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'فشل في تحديث حالة طلب الوقود',
      error: error.message
    });
  }
};

exports.updateFuelOrder = async (req, res) => {
  try {
    const fuelOrder = await FuelOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fuelOrder) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على طلب الوقود'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم تحديث طلب الوقود',
      data: fuelOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'فشل في تحديث طلب الوقود',
      error: error.message
    });
  }
};

exports.deleteFuelOrder = async (req, res) => {
  try {
    const fuelOrder = await FuelOrder.findByIdAndDelete(req.params.id);
    if (!fuelOrder) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على طلب الوقود'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم حذف طلب الوقود بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'فشل في حذف طلب الوقود',
      error: error.message
    });
  }
};

exports.updateThreshold = async (req, res) => {
  try {
    const { fuelType, threshold } = req.body;
    if (!fuelType || threshold === undefined) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد نوع الوقود والحد الأدنى'
      });
    }

    let order = await FuelOrder.findOne({ fuelType });
    if (!order) {
      order = new FuelOrder({
        facilityName: 'المنشأة الافتراضية',
        ownerName: 'المدير',
        contactNumber: '000000000',
        fuelType,
        quantity: 0,
        deliveryDate: new Date(),
        currentStock: 0,
        threshold: 0
      });
    }

    order.threshold = threshold;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الحد الأدنى للوقود بنجاح',
      data: { fuelType, threshold }
    });
  } catch (err) {
    console.error('Error updating fuel threshold:', err);
    res.status(500).json({
      success: false,
      message: 'فشل تحديث الحد الأدنى للوقود',
      error: err.message
    });
  }
};

exports.decreaseStock = async (fuelType, consumedQuantity) => {
  try {
    const order = await FuelOrder.findOne({ fuelType });
    if (!order) {
      console.warn(`لا يوجد سجل مخزون لنوع الوقود: ${fuelType}`);
      return { success: false, message: 'نوع الوقود غير موجود' };
    }

    order.currentStock = Math.max(0, (order.currentStock || 0) - consumedQuantity);
    await order.save();

    if (order.threshold !== null && order.currentStock <= order.threshold) {
      await createLowStockAlert({
        itemName: `وقود ${fuelType}`,
        itemType: 'fuel',
        currentStock: order.currentStock,
        threshold: order.threshold,
        category: 'fuel',
        targetRole: 'admin'
      });
    }

    return { success: true, data: order };
  } catch (err) {
    console.error('Error decreasing fuel stock:', err);
    return { success: false, message: err.message };
  }
};

exports.getInventory = async (req, res) => {
  try {
    const orders = await FuelOrder.find({}, 'fuelType currentStock threshold');
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'فشل جلب بيانات مخزون الوقود'
    });
  }
};