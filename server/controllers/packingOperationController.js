const PackingOperation = require('../models/PackingOperation');

// @desc    إنشاء عملية فرز وتعبئة جديدة
// @route   POST /api/packing-operations
// @access  Public
exports.createPackingOperation = async (req, res) => {
  try {
    const operation = new PackingOperation(req.body);
    await operation.save();
    
    res.status(201).json({
      success: true,
      message: 'تم تسجيل عملية الفرز والتعبئة بنجاح',
      data: operation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل العملية',
      error: error.message
    });
  }
};

// @desc    الحصول على جميع العمليات
// @route   GET /api/packing-operations
// @access  Public
exports.getAllOperations = async (req, res) => {
  try {
    const { 
      productType, 
      operatorName, 
      shift, 
      status,
      startDate,
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    if (productType) query.productType = productType;
    if (operatorName) query.operatorName = { $regex: operatorName, $options: 'i' };
    if (shift) query.shift = shift;
    if (status) query.status = status;
    
    if (startDate && endDate) {
      query.sortingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const total = await PackingOperation.countDocuments(query);
    
    const operations = await PackingOperation.find(query)
      .sort({ sortingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: operations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب العمليات',
      error: error.message
    });
  }
};

// @desc    الحصول على عملية محددة
// @route   GET /api/packing-operations/:id
// @access  Public
exports.getOperationById = async (req, res) => {
  try {
    const operation = await PackingOperation.findById(req.params.id);
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'العملية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: operation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب العملية',
      error: error.message
    });
  }
};

// @desc    تحديث عملية
// @route   PUT /api/packing-operations/:id
// @access  Public
exports.updateOperation = async (req, res) => {
  try {
    const operation = await PackingOperation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'العملية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث العملية بنجاح',
      data: operation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث العملية',
      error: error.message
    });
  }
};

// @desc    حذف عملية
// @route   DELETE /api/packing-operations/:id
// @access  Public
exports.deleteOperation = async (req, res) => {
  try {
    const operation = await PackingOperation.findByIdAndDelete(req.params.id);
    
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'العملية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم حذف العملية بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف العملية',
      error: error.message
    });
  }
};

// @desc    الحصول على إحصائيات العمليات
// @route   GET /api/packing-operations/stats/summary
// @access  Public
exports.getOperationsStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const totalOperations = await PackingOperation.countDocuments();
    const totalQuantity = await PackingOperation.aggregate([
      { $group: { _id: null, total: { $sum: '$totalQuantity' } } }
    ]);
    
    const byProductType = await PackingOperation.aggregate([
      {
        $group: {
          _id: '$productType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$totalQuantity' },
          avgGradeA: { $avg: '$gradeA' },
          avgRejected: { $avg: '$rejected' }
        }
      }
    ]);
    
    const byShift = await PackingOperation.aggregate([
      {
        $group: {
          _id: '$shift',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$totalQuantity' }
        }
      }
    ]);
    
    const qualityMetrics = await PackingOperation.aggregate([
      {
        $group: {
          _id: null,
          totalGradeA: { $sum: '$gradeA' },
          totalGradeB: { $sum: '$gradeB' },
          totalGradeC: { $sum: '$gradeC' },
          totalRejected: { $sum: '$rejected' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalOperations,
        totalQuantity: totalQuantity[0]?.total || 0,
        byProductType,
        byShift,
        qualityMetrics: qualityMetrics[0] || {},
        rejectionRate: qualityMetrics[0] 
          ? ((qualityMetrics[0].totalRejected / (qualityMetrics[0].totalGradeA + qualityMetrics[0].totalGradeB + qualityMetrics[0].totalGradeC + qualityMetrics[0].totalRejected)) * 100).toFixed(2)
          : 0
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