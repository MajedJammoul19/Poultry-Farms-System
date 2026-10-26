import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/signup');
    // redirect فقط إذا انتهت صلاحية التوكن، لا عند محاولة الدخول
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export const signup = async (userData) => {
  console.log('Sending data:', userData); 
  try {
    const response = await api.post('/auth/signup', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في إنشاء الحساب. الرجاء المحاولة لاحقاً'
    );
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.user) {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        sessionStorage.removeItem('token');
      }
      return {
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
          name: response.data.user.name,
          companyName: response.data.user.companyName || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || ''
        },
        token: response.data.token
      };
    }
    throw new Error('بيانات المستخدم غير مكتملة');
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error);
    const err = new Error(error.response?.data?.message || 'فشل تسجيل الدخول');
    err.errorCode = error.response?.data?.errorCode || null;
    throw err;
  }
};

export const verifyMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch {
    return null;
  }
};

export const updateTraderProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      'تعذر تحديث بيانات الملف الشخصي'
    );
  }
};

export const getAlerts = async (params = {}) => {
  try {
    const response = await api.get('/alerts', { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      'تعذر تحميل التنبيهات المهمة'
    );
  }
};

export const getRecentLogins = async (limit = 10) => {
  try {
    const response = await api.get('/auth/recent-logins', {
      params: { limit }
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('getRecentLogins error:', error);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      'تعذر تحميل آخر تسجيلات الدخول'
    );
  }
};

export const createOrder = async (orderData) => {
  console.log('Sending order data:', orderData);
  try {
    const response = await api.post('/orders', orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في إنشاء الطلب. الرجاء المحاولة لاحقاً'
    );
  }
};

export const getOrders = async (params = {}) => {
  console.log('Fetching orders with params:', params);
  try {
    const response = await api.get('/orders', {
      params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في جلب البيانات. الرجاء المحاولة لاحقاً'
    );
  }
};

export const createFuelOrder = async (orderData) => {
  console.log('Sending order data:', orderData);
  try {
    const response = await api.post('/fuel-orders', orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في إنشاء الطلب. الرجاء المحاولة لاحقاً'
    );
  }
};

export const createSanitationReport = async (reportData) => {
  console.log('Sending sanitation report data:', reportData);
  try {
    const response = await api.post('/sanitation-reports', reportData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في إرسال بلاغ النظافة. الرجاء المحاولة لاحقاً'
    );
  }
};

export const createPreventionPlan = async (reportData) => {
  console.log('Sending prevention plan report data:', reportData);
  try {
    const response = await api.post('/prevention-plans', reportData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في إرسال خطة الوقاية. الرجاء المحاولة لاحقاً'
    );
  }
};

export const createExamination = async (reportData) => {
  console.log('📋 إرسال بيانات الفحص الطبي:', reportData);
  const token = localStorage.getItem('token');
  console.log('🔑 التوكن الموجود في localStorage:', token ? '✅ موجود' : '❌ غير موجود');
  console.log('🔑 قيمة التوكن (أول 20 حرف):', token ? token.substring(0, 20) + '...' : 'لا يوجد');
  try {
    const response = await api.post('/medical-examinations', reportData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ تم إرسال الفحص الطبي بنجاح:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ خطأ في إرسال الفحص الطبي:');
    console.log('❌ رسالة الخطأ:', error.message);
    console.log('❌ حالة الخطأ:', error.response?.status);
    console.log('❌ بيانات الخطأ:', error.response?.data);
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      'فشل في إرسال الفحص الطبي. الرجاء المحاولة لاحقاً'
    );
  }
};

export const updateFoodThreshold = async (foodType, threshold) => {
  try {
    const response = await api.put('/food-orders/threshold', { foodType, threshold });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل تحديث الحد الأدنى للعلف'
    );
  }
};

export const updateFuelThreshold = async (fuelType, threshold) => {
  try {
    const response = await api.put('/fuel-orders/threshold', { fuelType, threshold });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل تحديث الحد الأدنى للوقود'
    );
  }
};

export const createFoodConsumption = async (data) => {
  try {
    const response = await api.post('/food-consumption', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل تسجيل الاستهلاك');
  }
};

export const getFoodConsumptions = async (limit = 500) => {
  try {
    const response = await api.get('/food-consumption', { params: { limit } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل جلب سجلات الاستهلاك');
  }
};

export const getFoodInventory = async () => {
  try {
    const response = await api.get('/food-orders/inventory');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب بيانات المخزون'
    );
  }
};

export const getFuelInventory = async () => {
  try {
    const response = await api.get('/fuel-orders/inventory');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب بيانات مخزون الوقود'
    );
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/auth/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل جلب قائمة المستخدمين');
  }
};

export const updateUserByAdmin = async (id, data) => {
  try {
    const response = await api.put(`/auth/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل تحديث بيانات المستخدم');
  }
};

export const deleteUserByAdmin = async (id) => {
  try {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل حذف المستخدم');
  }
};

export const resetUserPasswordByAdmin = async (id, newPassword) => {
  try {
    const response = await api.put(`/auth/users/${id}/reset-password`, { newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل إعادة تعيين كلمة المرور');
  }
};

export const getMedicalRequests = async (params = {}) => {
  try {
    const response = await api.get('/medical-requests', { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب الطلبات الطبية'
    );
  }
};

export const getSystemSettings = async () => {
  try {
    const response = await api.get('/system-settings');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب إعدادات النظام'
    );
  }
};

export const updateSystemSettings = async (sections) => {
  try {
    const response = await api.put('/system-settings', { sections });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل حفظ إعدادات النظام'
    );
  }
};

export const getQuickReport = async (period) => {
  try {
    const response = await api.get(`/reports/quick?period=${period}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب بيانات التقرير'
    );
  }
};

export const getFuelInvoices = async () => {
  try {
    const response = await api.get('/fuel-orders/invoices');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب الفواتير'
    );
  }
};

export const getFuelSuppliersAvailability = async () => {
  try {
    const response = await api.get('/auth/fuel-suppliers-availability');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب مواعيد تجار الوقود'
    );
  }
};

export const getAvailabilitySchedule = async () => {
  try {
    const response = await api.get('/auth/availability');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل جلب جدول التوفر'
    );
  }
};

export const updateAvailabilitySchedule = async (schedule) => {
  try {
    const response = await api.put('/auth/availability', { schedule });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'فشل تحديث جدول التوفر'
    );
  }
};