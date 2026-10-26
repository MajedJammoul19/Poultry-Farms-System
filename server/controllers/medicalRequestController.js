const express = require('express');
const MedicalRequest = require('../models/MedicalRequest');
// @desc    إنشاء طلب طبي جديد
// @route   POST /api/medical-requests
// @access  Public
exports.createMedicalRequest = async (req, res) => {
  try {
    const medicalRequest = new MedicalRequest(req.body);
    await medicalRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إرسال الطلب الطبي بنجاح',
      data: medicalRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال الطلب',
      error: error.message
    });
  }
};

// @desc    الحصول على جميع الطلبات الطبية
// @route   GET /api/medical-requests
// @access  Public
exports.getAllMedicalRequests = async (req, res) => {
  try {
    const { 
      status, 
      priority,
      poultryType,
      facilityName,
      startDate,
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (poultryType) query.poultryType = poultryType;
    if (facilityName) query.facilityName = { $regex: facilityName, $options: 'i' };
    
    if (startDate && endDate) {
      query.requestDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const total = await MedicalRequest.countDocuments(query);
    
    const requests = await MedicalRequest.find(query)
      .sort({ priority: 1, requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: requests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلبات',
      error: error.message
    });
  }
};

// @desc    الحصول على طلب طبي محدد
// @route   GET /api/medical-requests/:id
// @access  Public
exports.getMedicalRequestById = async (req, res) => {
  try {
    const medicalRequest = await MedicalRequest.findById(req.params.id);
    
    if (!medicalRequest) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: medicalRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلب',
      error: error.message
    });
  }
};

// @desc    تحديث طلب طبي
// @route   PUT /api/medical-requests/:id
// @access  Public (مع رمز سري)
exports.updateMedicalRequest = async (req, res) => {
  try {
    const { adminSecret, ...updateData } = req.body;
    
    // التحقق من الرمز السري
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالتعديل. رمز المدير غير صحيح'
      });
    }
    
    const medicalRequest = await MedicalRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!medicalRequest) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث الطلب بنجاح',
      data: medicalRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الطلب',
      error: error.message
    });
  }
};

// @desc    حذف طلب طبي
// @route   DELETE /api/medical-requests/:id
// @access  Public (مع رمز سري)
exports.deleteMedicalRequest = async (req, res) => {
  try {
    const { adminSecret } = req.body;
    
    // التحقق من الرمز السري
    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'admin123') {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالحذف. رمز المدير غير صحيح'
      });
    }
    
    const medicalRequest = await MedicalRequest.findByIdAndDelete(req.params.id);
    
    if (!medicalRequest) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم حذف الطلب بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الطلب',
      error: error.message
    });
  }
};

// @desc    تحديث حالة الطلب
// @route   PATCH /api/medical-requests/:id/status
// @access  Public (مع رمز سري)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason, adminSecret } = req.body;
    
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
    
    const updateData = { status };
    if (status === 'مرفوض' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    if (status === 'تم الموافقة') {
      updateData.diagnosisDate = new Date();
    }
    
    const medicalRequest = await MedicalRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!medicalRequest) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: medicalRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الطلب',
      error: error.message
    });
  }
};

// @desc    الحصول على إحصائيات الطلبات
// @route   GET /api/medical-requests/stats/summary
// @access  Public
exports.getRequestStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const totalRequests = await MedicalRequest.countDocuments();
    const pendingRequests = await MedicalRequest.countDocuments({ status: 'قيد المراجعة' });
    const approvedRequests = await MedicalRequest.countDocuments({ status: 'تم الموافقة' });
    const completedRequests = await MedicalRequest.countDocuments({ status: 'مكتمل' });
    const rejectedRequests = await MedicalRequest.countDocuments({ status: 'مرفوض' });
    
    const urgentRequests = await MedicalRequest.countDocuments({ priority: 'عاجل', status: { $ne: 'مكتمل' } });
    
    const byStatus = await MedicalRequest.getRequestStats(startDate, endDate);
    
    const totalBirds = await MedicalRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$birdCount' } } }
    ]);
    
    const totalMortality = await MedicalRequest.aggregate([
      { $group: { _id: null, total: { $sum: '$mortalityCount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        completedRequests,
        rejectedRequests,
        urgentRequests,
        byStatus,
        totalBirds: totalBirds[0]?.total || 0,
        totalMortality: totalMortality[0]?.total || 0
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

// @desc    البحث عن طلبات طبية
// @route   GET /api/medical-requests/search/:keyword
// @access  Public
exports.searchMedicalRequests = async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const requests = await MedicalRequest.find({
      $or: [
        { requestNumber: { $regex: keyword, $options: 'i' } },
        { facilityName: { $regex: keyword, $options: 'i' } },
        { ownerName: { $regex: keyword, $options: 'i' } },
        { contactNumber: { $regex: keyword, $options: 'i' } },
        { medicationName: { $regex: keyword, $options: 'i' } }
      ]
    }).sort({ requestDate: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
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