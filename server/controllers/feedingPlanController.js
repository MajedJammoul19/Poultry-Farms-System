const FeedingPlan = require('../models/FeedingPlan');

// @desc    إنشاء خطة تغذية جديدة
// @route   POST /api/feeding-plans
// @access  Public
exports.createFeedingPlan = async (req, res) => {
  try {
    const feedingPlan = new FeedingPlan(req.body);
    await feedingPlan.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء خطة التغذية بنجاح',
      data: feedingPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء خطة التغذية',
      error: error.message
    });
  }
};

// @desc    الحصول على جميع خطط التغذية
// @route   GET /api/feeding-plans
// @access  Public
exports.getAllFeedingPlans = async (req, res) => {
  try {
    const { poultryType, isActive, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (poultryType) query.poultryType = poultryType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const total = await FeedingPlan.countDocuments(query);
    
    const feedingPlans = await FeedingPlan.find(query)
      .sort({ poultryType: 1, startDay: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: feedingPlans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب خطط التغذية',
      error: error.message
    });
  }
};

// @desc    الحصول على خطة تغذية محددة
// @route   GET /api/feeding-plans/:id
// @access  Public
exports.getFeedingPlanById = async (req, res) => {
  try {
    const feedingPlan = await FeedingPlan.findById(req.params.id);
    
    if (!feedingPlan) {
      return res.status(404).json({
        success: false,
        message: 'خطة التغذية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: feedingPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب خطة التغذية',
      error: error.message
    });
  }
};

// @desc    تحديث خطة تغذية
// @route   PUT /api/feeding-plans/:id
// @access  Public
exports.updateFeedingPlan = async (req, res) => {
  try {
    const feedingPlan = await FeedingPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, context: 'query' }
    );
    
    if (!feedingPlan) {
      return res.status(404).json({
        success: false,
        message: 'خطة التغذية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث خطة التغذية بنجاح',
      data: feedingPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث خطة التغذية',
      error: error.message
    });
  }
};

// @desc    حذف خطة تغذية
// @route   DELETE /api/feeding-plans/:id
// @access  Public
exports.deleteFeedingPlan = async (req, res) => {
  try {
    const feedingPlan = await FeedingPlan.findByIdAndDelete(req.params.id);
    
    if (!feedingPlan) {
      return res.status(404).json({
        success: false,
        message: 'خطة التغذية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم حذف خطة التغذية بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف خطة التغذية',
      error: error.message
    });
  }
};

// @desc    الحصول على خطط حسب نوع الدواجن
// @route   GET /api/feeding-plans/poultry/:type
// @access  Public
exports.getPlansByPoultryType = async (req, res) => {
  try {
    const plans = await FeedingPlan.find({
      poultryType: req.params.type,
      isActive: true
    }).sort({ startDay: 1 });
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الخطط',
      error: error.message
    });
  }
};

// @desc    البحث عن خطط تغذية
// @route   GET /api/feeding-plans/search/:keyword
// @access  Public
exports.searchFeedingPlans = async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const plans = await FeedingPlan.find({
      $or: [
        { planName: { $regex: keyword, $options: 'i' } },
        { ingredients: { $regex: keyword, $options: 'i' } },
        { specialInstructions: { $regex: keyword, $options: 'i' } }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث',
      error: error.message
    });
  }
};