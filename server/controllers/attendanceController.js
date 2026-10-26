const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    تسجيل حضور الموظف (Check-In)
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
exports.checkIn = async (req, res) => {
  try {
    const userId = req.userId; // من authMiddleware
    const userRole = req.userRole;

    if (userRole !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'تسجيل الحضور خاص بالموظفين فقط.',
      });
    }

    // الحصول على تاريخ اليوم بدقة (بدون وقت)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // الحصول على معلومات الجهاز وعنوان IP (اختياري)
    const deviceInfo = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // إنشاء سجل حضور جديد
    const attendance = await Attendance.create({
      userId,
      date: today,
      checkInTime: new Date(),
      status: 'checked-in',
      deviceInfo: deviceInfo.substring(0, 200), // تخزين أول 200 حرف فقط
      ipAddress: ipAddress,
    });

    // جلب اسم المستخدم لعرضه في الاستجابة
    const user = await User.findById(userId).select('name email role');

    res.status(201).json({
      success: true,
      message: 'تم تسجيل الحضور بنجاح',
      data: {
        id: attendance._id,
        userId: attendance.userId,
        userName: user ? user.name : 'Unknown',
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        status: attendance.status,
      },
    });
  } catch (error) {
    console.error('Error in checkIn:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الحضور',
      error: error.message,
    });
  }
};

// @desc    تسجيل انصراف الموظف (Check-Out)
// @route   PUT /api/attendance/check-out
// @access  Private (Employee)
exports.checkOut = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'تسجيل الانصراف خاص بالموظفين فقط.',
      });
    }

    // الحصول على تاريخ اليوم بدقة
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // البحث عن آخر جلسة حضور مفتوحة (بصرف النظر عن التاريخ)
    const attendance = await Attendance.findOne({
      userId,
      status: 'checked-in',
    }).sort({ checkInTime: -1 });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد سجل حضور مفتوح لهذا اليوم. يرجى تسجيل الحضور أولاً.',
      });
    }

    // التحقق من أن وقت الانصراف بعد وقت الحضور
    const now = new Date();
    if (now < attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'وقت الانصراف لا يمكن أن يكون قبل وقت الحضور',
      });
    }

    // تحديث وقت الانصراف والحالة
    attendance.checkOutTime = now;
    attendance.status = 'checked-out';
    
    // حساب عدد الساعات
    attendance.calculateTotalHours();

    await attendance.save();

    // جلب اسم المستخدم
    const user = await User.findById(userId).select('name email role');

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الانصراف بنجاح',
      data: {
        id: attendance._id,
        userId: attendance.userId,
        userName: user ? user.name : 'Unknown',
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        totalHours: attendance.totalHours,
        status: attendance.status,
      },
    });
  } catch (error) {
    console.error('Error in checkOut:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الانصراف',
      error: error.message,
    });
  }
};

// @desc    الحصول على حالة الحضور اليوم للمستخدم الحالي
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // حضور اليوم فقط
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId,
      checkInTime: { $gte: today, $lt: tomorrow },
    }).sort({ checkInTime: -1 }).populate('userId', 'name email role');

    if (!attendance) {
      return res.status(200).json({
        success: true,
        data: {
          hasAttendance: false,
          status: null,
          checkInTime: null,
          checkOutTime: null,
          totalHours: null,
          user: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasAttendance: true,
        id: attendance._id,
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        totalHours: attendance.totalHours,
        date: attendance.date,
        user: {
          id: attendance.userId._id,
          name: attendance.userId.name,
          email: attendance.userId.email,
          role: attendance.userId.role,
        },
      },
    });
  } catch (error) {
    console.error('Error in getTodayAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الحضور',
      error: error.message,
    });
  }
};

// @desc    الحصول على سجل حضور المستخدم (تاريخي)
// @route   GET /api/attendance/history
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 30, page = 1, startDate, endDate } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // بناء فلتر التاريخ
    let dateFilter = { userId };
    
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = end;
      }
    }

    const attendances = await Attendance.find(dateFilter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email role');

    const total = await Attendance.countDocuments(dateFilter);

    // حساب إحصائيات إضافية
    const totalHoursWorked = attendances.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const totalDaysPresent = attendances.length;
    const averageHoursPerDay = totalDaysPresent > 0 ? (totalHoursWorked / totalDaysPresent).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: attendances,
      stats: {
        totalHoursWorked: totalHoursWorked.toFixed(2),
        totalDaysPresent,
        averageHoursPerDay,
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error in getAttendanceHistory:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب سجل الحضور',
      error: error.message,
    });
  }
};

// @desc    الحصول على سجل حضور جميع الموظفين (للأدمن فقط)
// @route   GET /api/attendance/admin/history
// @access  Private (Admin)
exports.getAllAttendanceHistory = async (req, res) => {
  try {
    const userRole = req.userRole;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بالوصول إلى هذه البيانات',
      });
    }

    const { limit = 30, page = 1, startDate, endDate, employeeId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let dateFilter = {};
    if (employeeId) dateFilter.userId = employeeId;

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = end;
      }
    }

    const attendances = await Attendance.find(dateFilter)
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email role');

    const total = await Attendance.countDocuments(dateFilter);

    const totalHoursWorked = attendances.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const totalDaysPresent = attendances.length;
    const averageHoursPerDay = totalDaysPresent > 0 ? (totalHoursWorked / totalDaysPresent).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: attendances,
      stats: {
        totalHoursWorked: totalHoursWorked.toFixed(2),
        totalDaysPresent,
        averageHoursPerDay,
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error in getAllAttendanceHistory:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب سجل الحضور',
      error: error.message,
    });
  }
};

// @desc    الحصول على إحصائيات الحضور لجميع الموظفين (للمدير والأدمن)
// @route   GET /api/attendance/admin/stats
// @access  Private (Admin/Manager)
exports.getAdminAttendanceStats = async (req, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بالوصول إلى هذه البيانات',
      });
    }

    const { date } = req.query;
    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date);
    }
    targetDate.setHours(0, 0, 0, 0);

    // جلب جميع المستخدمين من نوع employee
    const employees = await User.find({ role: 'employee', isActive: true }).select('_id name email');

    // جلب سجلات الحضور لهذا اليوم
    const attendances = await Attendance.find({
      date: targetDate,
      userId: { $in: employees.map(emp => emp._id) },
    });

    const stats = {
      date: targetDate,
      totalEmployees: employees.length,
      checkedIn: attendances.filter(a => a.status === 'checked-in').length,
      checkedOut: attendances.filter(a => a.status === 'checked-out').length,
      absent: employees.length - attendances.length,
      attendanceRate: employees.length > 0 ? ((attendances.length / employees.length) * 100).toFixed(2) : 0,
      details: employees.map(emp => {
        const attendance = attendances.find(a => a.userId.toString() === emp._id.toString());
        return {
          employeeId: emp._id,
          employeeName: emp.name,
          employeeEmail: emp.email,
          hasAttendance: !!attendance,
          status: attendance ? attendance.status : 'absent',
          checkInTime: attendance ? attendance.checkInTime : null,
          checkOutTime: attendance ? attendance.checkOutTime : null,
          totalHours: attendance ? attendance.totalHours : 0,
        };
      }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in getAdminAttendanceStats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب إحصائيات الحضور',
      error: error.message,
    });
  }
};

// @desc    تحديث سجل الحضور (للإدمن فقط)
// @route   PUT /api/attendance/:id
// @access  Private (Admin)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInTime, checkOutTime, notes } = req.body;
    const userRole = req.userRole;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بتعديل سجلات الحضور',
      });
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'سجل الحضور غير موجود',
      });
    }

    if (checkInTime) attendance.checkInTime = new Date(checkInTime);
    if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);
    if (notes !== undefined) attendance.notes = notes;

    // إعادة حساب عدد الساعات إذا تم تحديث كلا الوقتين
    if (attendance.checkInTime && attendance.checkOutTime) {
      attendance.calculateTotalHours();
      attendance.status = 'checked-out';
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث سجل الحضور بنجاح',
      data: attendance,
    });
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث سجل الحضور',
      error: error.message,
    });
  }
};

// @desc    حذف سجل الحضور (للإدمن فقط)
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.userRole;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح لك بحذف سجلات الحضور',
      });
    }

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'سجل الحضور غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف سجل الحضور بنجاح',
    });
  } catch (error) {
    console.error('Error in deleteAttendance:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف سجل الحضور',
      error: error.message,
    });
  }
};