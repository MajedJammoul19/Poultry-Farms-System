const FuelConsumption = require('../models/FuelConsumption');
const { decreaseStock } = require('./fuelOrderController');

exports.createConsumption = async (req, res) => {
  try {
    const consumption = new FuelConsumption(req.body);
    await consumption.save();

    const fuelType = consumption.fuelType;
    const consumedQty = consumption.fuelAmount || 0;
    if (fuelType && consumedQty > 0) {
      const result = await decreaseStock(fuelType, consumedQty);
      if (!result.success) {
        console.warn('تنبيه: فشل تحديث مخزون الوقود:', result.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل استهلاك الوقود بنجاح',
      data: consumption
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الاستهلاك',
      error: error.message
    });
  }
};

exports.getAllConsumptions = async (req, res) => {
  try {
    const { 
      vehicleType, 
      vehicleNumber,
      driverName,
      fuelType,
      startDate,
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    if (vehicleType) query.vehicleType = vehicleType;
    if (vehicleNumber) query.vehicleNumber = { $regex: vehicleNumber, $options: 'i' };
    if (driverName) query.driverName = { $regex: driverName, $options: 'i' };
    if (fuelType) query.fuelType = fuelType;
    
    if (startDate && endDate) {
      query.recordDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const total = await FuelConsumption.countDocuments(query);
    
    const consumptions = await FuelConsumption.find(query)
      .sort({ recordDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: consumptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: error.message
    });
  }
};

exports.getConsumptionById = async (req, res) => {
  try {
    const consumption = await FuelConsumption.findById(req.params.id);
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }
    res.status(200).json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب السجل',
      error: error.message
    });
  }
};

exports.updateConsumption = async (req, res) => {
  try {
    const consumption = await FuelConsumption.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم تحديث السجل بنجاح',
      data: consumption
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث السجل',
      error: error.message
    });
  }
};

exports.deleteConsumption = async (req, res) => {
  try {
    const consumption = await FuelConsumption.findByIdAndDelete(req.params.id);
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم حذف السجل بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف السجل',
      error: error.message
    });
  }
};

exports.predictFutureConsumption = async (req, res) => {
  try {
    const { days = 30, vehicleType } = req.query;
    const predictions = await FuelConsumption.predictFutureConsumption(
      parseInt(days),
      vehicleType
    );
    res.status(200).json({
      success: true,
      data: {
        predictions,
        period: `${days} يوم`,
        vehicleType: vehicleType || 'الكل'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التنبؤ',
      error: error.message
    });
  }
};

exports.getConsumptionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const totalRecords = await FuelConsumption.countDocuments();
    const totalFuel = await FuelConsumption.aggregate([
      { $group: { _id: null, total: { $sum: '$fuelAmount' } } }
    ]);
    const totalCost = await FuelConsumption.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);
    const byVehicleType = await FuelConsumption.getConsumptionStats(startDate, endDate);
    const bestEfficiency = await FuelConsumption.findOne()
      .sort({ efficiency: -1 })
      .select('vehicleNumber efficiency consumptionRate');
    const worstEfficiency = await FuelConsumption.findOne()
      .sort({ efficiency: 1 })
      .select('vehicleNumber efficiency consumptionRate');
    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        totalFuel: totalFuel[0]?.total || 0,
        totalCost: totalCost[0]?.total || 0,
        averageCostPerLiter: totalCost[0]?.total / totalFuel[0]?.total || 0,
        byVehicleType,
        bestEfficiency,
        worstEfficiency
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      error: error.message
    });
  }
};