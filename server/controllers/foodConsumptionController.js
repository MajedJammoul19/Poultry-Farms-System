const FoodConsumption = require('../models/FoodConsumption');
const { decreaseStock } = require('./foodOrderController');

exports.createConsumption = async (req, res) => {
  try {
    const consumption = new FoodConsumption(req.body);
    await consumption.save();

    const feedType = consumption.feedType;
    const consumedQty = consumption.dailyConsumption || 0;
    if (feedType && consumedQty > 0) {
      const result = await decreaseStock(feedType, consumedQty);
      if (!result.success) {
        console.warn('تنبيه: فشل تحديث المخزون:', result.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل استهلاك الغذاء بنجاح',
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
      poultryType, 
      batchNumber,
      startDate,
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    if (poultryType) query.poultryType = poultryType;
    if (batchNumber) query.batchNumber = { $regex: batchNumber, $options: 'i' };
    
    if (startDate && endDate) {
      query.recordDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const total = await FoodConsumption.countDocuments(query);
    
    const consumptions = await FoodConsumption.find(query)
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
    const consumption = await FoodConsumption.findById(req.params.id);
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
    const consumption = await FoodConsumption.findByIdAndUpdate(
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
    const consumption = await FoodConsumption.findByIdAndDelete(req.params.id);
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
    const { days = 30, poultryType } = req.query;
    const predictedConsumption = await FoodConsumption.predictFutureConsumption(
      parseInt(days),
      poultryType
    );
    const recommendations = {
      daily: predictedConsumption / parseInt(days),
      weekly: (predictedConsumption / parseInt(days)) * 7,
      monthly: predictedConsumption,
      quarterly: predictedConsumption * 3,
      safetyStock: predictedConsumption * 0.15
    };
    res.status(200).json({
      success: true,
      data: {
        predictedConsumption,
        recommendations,
        period: `${days} يوم`,
        poultryType: poultryType || 'الكل'
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
    const totalRecords = await FoodConsumption.countDocuments();
    const totalConsumption = await FoodConsumption.aggregate([
      { $group: { _id: null, total: { $sum: '$dailyConsumption' } } }
    ]);
    const byPoultryType = await FoodConsumption.getConsumptionStats(startDate, endDate);
    const averageConversion = await FoodConsumption.aggregate([
      { $group: { _id: null, avg: { $avg: '$conversionRate' } } }
    ]);
    const topBatches = await FoodConsumption.find()
      .sort({ dailyConsumption: -1 })
      .limit(5)
      .select('batchNumber poultryType dailyConsumption');
    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        totalDailyConsumption: totalConsumption[0]?.total || 0,
        averageConversionRate: averageConversion[0]?.avg || 0,
        byPoultryType,
        topBatches
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