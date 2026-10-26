import { api } from './auth';

// جلب مهام اليوم (أو يوم محدد عبر date='YYYY-MM-DD')
export const getTasks = async (date = null) => {
  try {
    const url = date ? `/tasks?date=${date}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getTasks:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في جلب قائمة المهام' };
  }
};

// إضافة مهمة جديدة
export const createTask = async (data) => {
  try {
    const response = await api.post('/tasks', data);
    return response.data;
  } catch (error) {
    console.error('Error in createTask:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في إضافة المهمة' };
  }
};

// تعديل مهمة (تغيير العنوان أو حالة الإنجاز)
export const updateTask = async (id, data) => {
  try {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error in updateTask:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في تحديث المهمة' };
  }
};

// حذف مهمة
export const deleteTask = async (id) => {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteTask:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في حذف المهمة' };
  }
};