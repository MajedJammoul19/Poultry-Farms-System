const PreventionPlan = require('../models/PreventionPlan');

// Create new prevention plan
exports.createPreventionPlan = async (req, res) => {
  try {
    const { facilityName, location, date, preventionPlan, recommendations } = req.body;

    // Basic validation
    if (!facilityName || !location || !date || !preventionPlan || !recommendations) {
      return res.status(400).json({
        success: false,
        error: 'البيانات الأساسية ناقصة'
      });
    }

    const newPlan = await PreventionPlan.create({
      facilityName,
      location,
      date: date || Date.now(),
      preventionPlan,
      recommendations
    });

    res.status(201).json({
      success: true,
      data: newPlan
    });

  } catch (error) {
    console.error('Error creating prevention plan:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم'
    });
  }
};

// Add/update recommendations
exports.updateRecommendations = async (req, res) => {
  try {
    const { recommendations } = req.body;
    
    const plan = await PreventionPlan.findByIdAndUpdate(
      req.params.id,
      {
        recommendations,
        reviewedBy: req.user._id,
        status: 'approved'
      },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'خطة الوقاية غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('Error updating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم'
    });
  }
};

// Get all prevention plans
exports.getPreventionPlans = async (req, res) => {
  try {
    const plans = await PreventionPlan.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Error getting prevention plans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single prevention plan
exports.getPreventionPlan = async (req, res) => {
  try {
    const plan = await PreventionPlan.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'خطة الوقاية غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('Error getting prevention plan:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم'
    });
  }
};

// Delete prevention plan
exports.deletePreventionPlan = async (req, res) => {
  try {
    const plan = await PreventionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'خطة الوقاية غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف خطة الوقاية بنجاح',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting prevention plan:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم'
    });
  }
};

// Update prevention plan (fixed version)
exports.updatePreventionPlan = async (req, res) => {
  try {
    const { facilityName, location, date, preventionPlan, recommendations, status } = req.body;

    // First, find the existing plan to get its current status if needed
    const existingPlan = await PreventionPlan.findById(req.params.id);
    
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        error: 'خطة الوقاية غير موجودة'
      });
    }

    // Prepare update data
    const updateData = {
      facilityName,
      location,
      date,
      preventionPlan,
      recommendations
    };

    // Only update status if it's provided, otherwise keep the existing status
    if (status) {
      updateData.status = status;
    } else {
      updateData.status = existingPlan.status;
    }

    const plan = await PreventionPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: plan
    });
    
  } catch (error) {
    console.error('Error updating prevention plan:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم'
    });
  }
};