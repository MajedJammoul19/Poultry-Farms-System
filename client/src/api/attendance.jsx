import { api } from './auth';

// تسجيل حضور (Check-In)
export const checkIn = async () => {
  try {
    const response = await api.post('/attendance/check-in');
    return response.data;
  } catch (error) {
    console.error('Error in checkIn:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في تسجيل الحضور' };
  }
};

// تسجيل انصراف (Check-Out)
export const checkOut = async () => {
  try {
    const response = await api.put('/attendance/check-out');
    return response.data;
  } catch (error) {
    console.error('Error in checkOut:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في تسجيل الانصراف' };
  }
};

// جلب حالة الحضور اليوم
export const getTodayAttendance = async () => {
  try {
    const response = await api.get('/attendance/today');
    return response.data;
  } catch (error) {
    console.error('Error in getTodayAttendance:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في جلب حالة الحضور' };
  }
};

// جلب سجل الحضور التاريخي
export const getAttendanceHistory = async (page = 1, limit = 30, startDate = null, endDate = null) => {
  try {
    let url = `/attendance/history?page=${page}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getAttendanceHistory:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في جلب سجل الحضور' };
  }
};

// جلب سجل حضور جميع الموظفين (للأدمن فقط)
export const getAllAttendanceHistory = async (page = 1, limit = 30, startDate = null, endDate = null) => {
  try {
    let url = `/attendance/admin/history?page=${page}&limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getAllAttendanceHistory:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في جلب سجل الحضور' };
  }
};

// جلب إحصائيات الحضور لجميع الموظفين (للمدير والأدمن)
export const getAdminAttendanceStats = async (date = null) => {
  try {
    let url = '/attendance/admin/stats';
    if (date) url += `?date=${date}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getAdminAttendanceStats:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في جلب إحصائيات الحضور' };
  }
};

// تحديث سجل الحضور (للمدير والأدمن)
export const updateAttendance = async (id, data) => {
  try {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error in updateAttendance:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في تحديث سجل الحضور' };
  }
};

// حذف سجل الحضور (للمدير والأدمن)
export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteAttendance:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في حذف سجل الحضور' };
  }
};