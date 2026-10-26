const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/authMiddleware');

// ✅ تأكد من أن authMiddleware يُمرر بشكل صحيح
router.post('/api/attendance/check-in', authMiddleware, attendanceController.checkIn);
router.put('/api/attendance/check-out', authMiddleware, attendanceController.checkOut);
router.get('/api/attendance/today', authMiddleware, attendanceController.getTodayAttendance);
router.get('/api/attendance/history', authMiddleware, attendanceController.getAttendanceHistory);

// مسارات للإدمن فقط
router.get('/api/attendance/admin/stats', authMiddleware, attendanceController.getAdminAttendanceStats);
router.get('/api/attendance/admin/history', authMiddleware, attendanceController.getAllAttendanceHistory);
router.put('/api/attendance/:id', authMiddleware, attendanceController.updateAttendance);
router.delete('/api/attendance/:id', authMiddleware, attendanceController.deleteAttendance);

module.exports = router;