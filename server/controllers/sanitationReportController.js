const SanitationReport = require('../models/sanitationReportModel');
exports.createReport = async (req, res) => {
  try {
    // إنشاء البلاغ بدون ربطه بأي مستخدم
    const report = await SanitationReport.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'تم تقديم بلاغ النظافة بنجاح',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'فشل في تقديم البلاغ',
      error: error.message,
      validationErrors: error.errors || null
    });
  }
};
// جلب جميع تقارير النظافة
exports.getAllReports = async (req, res) => {
  try {
    const reports = await SanitationReport.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error getting sanitation reports:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تقارير النظافة',
      error: error.message
    });
  }
};

// delete report by id
exports.deleteReport = async (req, res) => {
  try {    const report = await SanitationReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على بلاغ النظافة'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم حذف بلاغ النظافة بنجاح'
    });
  }
    catch (error) { 
      console.error('Error deleting sanitation report:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في حذف بلاغ النظافة',
        error: error.message
      });
    }
};

// update report by id
exports.updateReport = async (req, res) => {
  try {
    const report = await SanitationReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على بلاغ النظافة'
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم تحديث بلاغ النظافة بنجاح',
      data: report
    });
  } catch (error) {
    console.error('Error updating sanitation report:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث بلاغ النظافة',
      error: error.message
    });
  }
};
