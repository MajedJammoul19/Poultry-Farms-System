const ManagerRecommendation = require('../models/ManagerRecommendation');

// @desc    إنشاء توصية جديدة (بدون مصادقة)
// @route   POST /api/manager-recommendations
// @access  Public
exports.createRecommendation = async (req, res) => {
  try {
    const {
      productivityIssues,
      improvementSuggestions,
      requiredResources,
      expectedOutcomes,
      additionalNotes,
      priority,
      submitterName,
      submitterEmail
    } = req.body;

    // التحقق من وجود الحقول المطلوبة
    if (!productivityIssues || !improvementSuggestions) {
      return res.status(400).json({
        success: false,
        message: 'المشاكل الحالية والحلول المقترحة مطلوبة'
      });
    }

    const recommendation = await ManagerRecommendation.create({
      productivityIssues,
      improvementSuggestions,
      requiredResources: requiredResources || '',
      expectedOutcomes: expectedOutcomes || '',
      additionalNotes: additionalNotes || '',
      priority: priority || 'متوسط',
      submitterName: submitterName || 'زائر',
      submitterEmail: submitterEmail || ''
    });

    res.status(201).json({
      success: true,
      message: 'تم إرسال التوصية بنجاح',
      data: recommendation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء التوصية',
      error: error.message
    });
  }
};

// @desc    الحصول على جميع التوصيات (للمشاهدة فقط)
// @route   GET /api/manager-recommendations
// @access  Public (للمشاهدة)
exports.getAllRecommendations = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // تصفية حسب الحالة
    if (status) {
      query.status = status;
    }
    
    // تصفية حسب الأولوية
    if (priority) {
      query.priority = priority;
    }
    
    // حساب عدد المستندات للتقسيم
    const total = await ManagerRecommendation.countDocuments(query);
    
    const recommendations = await ManagerRecommendation.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: recommendations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التوصيات',
      error: error.message
    });
  }
};

// @desc    الحصول على توصية محددة
// @route   GET /api/manager-recommendations/:id
// @access  Public
exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await ManagerRecommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'التوصية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التوصية',
      error: error.message
    });
  }
};

// @desc    تحديث توصية (يتطلب كلمة مرور أو token)
// @route   PUT /api/manager-recommendations/:id
// @access  Private (مع رمز سري)
exports.updateRecommendation = async (req, res) => {
  try {
    const {
      productivityIssues,
      improvementSuggestions,
      requiredResources,
      expectedOutcomes,
      additionalNotes,
      priority,
      adminSecret
    } = req.body;
    
    // التحقق من الرمز السري (يمكنك تغيير هذا)
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالتعديل. رمز المدير غير صحيح'
      });
    }
    
    let recommendation = await ManagerRecommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'التوصية غير موجودة'
      });
    }
    
    // تحديث الحقول
    const updateData = {};
    if (productivityIssues) updateData.productivityIssues = productivityIssues;
    if (improvementSuggestions) updateData.improvementSuggestions = improvementSuggestions;
    if (requiredResources !== undefined) updateData.requiredResources = requiredResources;
    if (expectedOutcomes !== undefined) updateData.expectedOutcomes = expectedOutcomes;
    if (additionalNotes !== undefined) updateData.additionalNotes = additionalNotes;
    if (priority) updateData.priority = priority;
    
    recommendation = await ManagerRecommendation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث التوصية بنجاح',
      data: recommendation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التوصية',
      error: error.message
    });
  }
};

// @desc    تحديث حالة التوصية (يتطلب رمز سري)
// @route   PATCH /api/manager-recommendations/:id/status
// @access  Private (مع رمز سري)
exports.updateRecommendationStatus = async (req, res) => {
  try {
    const { status, reviewNotes, implementationNotes, adminSecret } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'الحالة مطلوبة'
      });
    }
    
    // التحقق من الرمز السري
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بتحديث الحالة. رمز المدير غير صحيح'
      });
    }
    
    const recommendation = await ManagerRecommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'التوصية غير موجودة'
      });
    }
    
    // تحديث الحالة
    recommendation.status = status;
    
    if (reviewNotes) {
      recommendation.reviewNotes = reviewNotes;
    }
    
    if (implementationNotes) {
      recommendation.implementationNotes = implementationNotes;
    }
    
    if (status !== 'قيد المراجعة' && !recommendation.reviewedAt) {
      recommendation.reviewedAt = new Date();
    }
    
    if (status === 'تم التنفيذ') {
      recommendation.implementedAt = new Date();
    }
    
    await recommendation.save();
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة التوصية بنجاح',
      data: recommendation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة التوصية',
      error: error.message
    });
  }
};

// @desc    حذف توصية (يتطلب رمز سري)
// @route   DELETE /api/manager-recommendations/:id
// @access  Private (مع رمز سري)
exports.deleteRecommendation = async (req, res) => {
  try {
    const { adminSecret } = req.body;
    
    // التحقق من الرمز السري
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالحذف. رمز المدير غير صحيح'
      });
    }
    
    const recommendation = await ManagerRecommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'التوصية غير موجودة'
      });
    }
    
    await recommendation.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'تم حذف التوصية بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التوصية',
      error: error.message
    });
  }
};

// @desc    الحصول على إحصائيات التوصيات
// @route   GET /api/manager-recommendations/stats/summary
// @access  Public
exports.getRecommendationsStats = async (req, res) => {
  try {
    const total = await ManagerRecommendation.countDocuments();
    const pending = await ManagerRecommendation.countDocuments({ status: 'قيد المراجعة' });
    const inProgress = await ManagerRecommendation.countDocuments({ status: 'قيد التنفيذ' });
    const completed = await ManagerRecommendation.countDocuments({ status: 'تم التنفيذ' });
    const rejected = await ManagerRecommendation.countDocuments({ status: 'مرفوض' });
    
    const byPriority = await ManagerRecommendation.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentRecommendations = await ManagerRecommendation.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        completed,
        rejected,
        byPriority,
        recentRecommendations
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