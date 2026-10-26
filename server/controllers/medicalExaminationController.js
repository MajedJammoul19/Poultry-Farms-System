const MedicalExamination = require('../models/MedicalExamination');

// Create new medical examination
exports.createExamination = async (req, res) => {
  try {
    console.log('📥 البيانات المستلمة من العميل:', JSON.stringify(req.body, null, 2));
    
    const { date, vetName, location, chickenCount, healthStatus, dailyMortalityCount, notes } = req.body;

    // تسجيل القيمة المستلمة
    console.log('📊 dailyMortalityCount المستلم:', dailyMortalityCount, 'نوعه:', typeof dailyMortalityCount);

    // التحقق من وجود dailyMortalityCount
    if (dailyMortalityCount === undefined || dailyMortalityCount === null || dailyMortalityCount === '') {
      console.log('❌ dailyMortalityCount غير موجود أو فارغ');
      return res.status(400).json({
        success: false,
        error: 'عدد حالات النفوق اليومية مطلوب'
      });
    }

    // التحقق من البيانات الأساسية
    if (!date || !vetName || !location || !chickenCount || !healthStatus) {
      console.log('❌ بيانات أساسية ناقصة');
      return res.status(400).json({
        success: false,
        error: 'البيانات الأساسية ناقصة: التاريخ، اسم الطبيب، الموقع، عدد الدجاج، الحالة الصحية'
      });
    }

    // تحويل القيم الرقمية بشكل صحيح
    let parsedChickenCount = parseInt(chickenCount);
    let parsedDailyMortalityCount = null;

    // معالجة dailyMortalityCount
    if (typeof dailyMortalityCount === 'string') {
      parsedDailyMortalityCount = parseInt(dailyMortalityCount);
    } else if (typeof dailyMortalityCount === 'number') {
      parsedDailyMortalityCount = dailyMortalityCount;
    } else {
      parsedDailyMortalityCount = parseInt(dailyMortalityCount);
    }

    console.log('🔄 بعد التحويل - parsedChickenCount:', parsedChickenCount);
    console.log('🔄 بعد التحويل - parsedDailyMortalityCount:', parsedDailyMortalityCount);

    // التحقق من صحة parsedDailyMortalityCount
    if (isNaN(parsedDailyMortalityCount)) {
      console.log('❌ parsedDailyMortalityCount هو NaN');
      return res.status(400).json({
        success: false,
        error: 'عدد حالات النفوق اليومية يجب أن يكون رقماً صحيحاً'
      });
    }

    if (parsedDailyMortalityCount < 0) {
      console.log('❌ parsedDailyMortalityCount سالب');
      return res.status(400).json({
        success: false,
        error: 'عدد حالات النفوق اليومية لا يمكن أن يكون سالباً'
      });
    }

    if (isNaN(parsedChickenCount) || parsedChickenCount < 1) {
      console.log('❌ parsedChickenCount غير صالح');
      return res.status(400).json({
        success: false,
        error: 'عدد الدجاج يجب أن يكون رقماً صحيحاً أكبر من صفر'
      });
    }

    // إنشاء كائن البيانات للحفظ
    const examinationData = {
      date: date,
      vetName: vetName,
      location: location,
      chickenCount: parsedChickenCount,
      healthStatus: healthStatus,
      dailyMortalityCount: parsedDailyMortalityCount,
      notes: notes || ''
    };

    console.log('💾 البيانات التي سيتم حفظها في قاعدة البيانات:', JSON.stringify(examinationData, null, 2));

    // إنشاء الفحص الطبي
    const examination = await MedicalExamination.create(examinationData);

    console.log('✅ تم الحفظ بنجاح، dailyMortalityCount المحفوظ:', examination.dailyMortalityCount);

    res.status(201).json({
      success: true,
      data: examination
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء الفحص الطبي:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في الخادم'
    });
  }
};

// Get all medical examinations
exports.getExaminations = async (req, res) => {
  try {
    const examinations = await MedicalExamination.find()
      .sort('-date');

    console.log(`📋 تم جلب ${examinations.length} فحص طبي`);
    
    // تسجيل قيم dailyMortalityCount للتأكد
    examinations.forEach((exam, index) => {
      console.log(`📊 الفحص ${index + 1}: dailyMortalityCount = ${exam.dailyMortalityCount}`);
    });

    res.status(200).json({
      success: true,
      count: examinations.length,
      data: examinations
    });
  } catch (error) {
    console.error('Error getting medical examinations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single examination
exports.getExamination = async (req, res) => {
  try {
    const examination = await MedicalExamination.findById(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: 'تقرير الفحص الطبي غير موجود'
      });
    }

    console.log(`📊 فحص واحد: dailyMortalityCount = ${examination.dailyMortalityCount}`);

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error getting medical examination:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم'
    });
  }
};

// Update examination
exports.updateExamination = async (req, res) => {
  try {
    console.log('📥 بيانات التحديث المستلمة:', JSON.stringify(req.body, null, 2));
    
    const { date, vetName, location, chickenCount, healthStatus, dailyMortalityCount, notes } = req.body;

    const updateData = {};
    
    if (date) updateData.date = date;
    if (vetName) updateData.vetName = vetName;
    if (location) updateData.location = location;
    if (healthStatus) updateData.healthStatus = healthStatus;
    if (notes !== undefined) updateData.notes = notes;

    // معالجة chickenCount
    if (chickenCount !== undefined && chickenCount !== null && chickenCount !== '') {
      const parsedChickenCount = parseInt(chickenCount);
      if (!isNaN(parsedChickenCount) && parsedChickenCount > 0) {
        updateData.chickenCount = parsedChickenCount;
      }
    }

    // معالجة dailyMortalityCount بشكل منفصل ومفصل
    if (dailyMortalityCount !== undefined && dailyMortalityCount !== null && dailyMortalityCount !== '') {
      let parsedMortality = null;
      
      if (typeof dailyMortalityCount === 'string') {
        parsedMortality = parseInt(dailyMortalityCount);
      } else if (typeof dailyMortalityCount === 'number') {
        parsedMortality = dailyMortalityCount;
      } else {
        parsedMortality = parseInt(dailyMortalityCount);
      }
      
      if (!isNaN(parsedMortality) && parsedMortality >= 0) {
        updateData.dailyMortalityCount = parsedMortality;
        console.log('🔄 تحديث dailyMortalityCount إلى:', parsedMortality);
      } else {
        console.log('⚠️ قيمة dailyMortalityCount غير صالحة:', dailyMortalityCount);
      }
    }

    console.log('💾 بيانات التحديث النهائية:', JSON.stringify(updateData, null, 2));

    const examination = await MedicalExamination.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: 'تقرير الفحص الطبي غير موجود'
      });
    }

    console.log('✅ تم التحديث بنجاح، dailyMortalityCount الجديد:', examination.dailyMortalityCount);

    res.status(200).json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Error updating medical examination:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في الخادم'
    });
  }
};

// Delete examination
exports.deleteExamination = async (req, res) => {
  try {
    const examination = await MedicalExamination.findByIdAndDelete(req.params.id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        error: 'تقرير الفحص الطبي غير موجود'
      });
    }

    console.log('🗑️ تم حذف الفحص:', examination._id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting medical examination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ في الخادم'
    });
  }
};