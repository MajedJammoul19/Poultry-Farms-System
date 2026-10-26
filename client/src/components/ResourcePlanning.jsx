import React, { useState, useContext, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/auth-context';
import { getFoodInventory, getFuelInventory, updateFoodThreshold, updateFuelThreshold, getFoodConsumptions, getMedicalRequests, getAllUsers, signup, api } from '../api/auth';

const ROLE_NAMES = {
  admin: 'أدمن النظام',
  manager: 'مدير المنشأة',
  employee: 'موظف',
  vet: 'طبيب بيطري',
  food_supplier: 'تاجر مواد غذائية',
  fuel_supplier: 'تاجر وقود',
};

// الأقسام التي يمكن لمدير المنشأة تعيين عامل جديد للعمل بها من هذه الصفحة
// (لا تشمل admin/manager عمداً — إنشاء حسابات بصلاحيات إدارية يبقى محصوراً بصفحة إدارة المستخدمين الخاصة بالأدمن)
const DEPARTMENTS = [
  { role: 'employee',      label: 'العمالة العامة (نظافة، فرز وتعبئة)' },
  { role: 'vet',            label: 'القسم البيطري' },
  { role: 'food_supplier', label: 'قسم الأعلاف' },
  { role: 'fuel_supplier', label: 'قسم الوقود' },
];

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ResourcePlanning = () => {
  const navigate = useNavigate();
  const { user, userRole } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('feed');
  const [foodRequests, setFoodRequests] = useState([]);
  const [foodConsumptions, setFoodConsumptions] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [medicalRequests, setMedicalRequests] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholdInputs, setThresholdInputs] = useState({});

  // ─── البحث بالاسم ──────────────────────────────────────────────
  const [workersSearch, setWorkersSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');

  // ─── تعيين عامل جديد ───────────────────────────────────────────
  const [addedWorkers, setAddedWorkers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStep, setAssignStep] = useState('form'); // 'form' | 'confirm'
  const [assignForm, setAssignForm] = useState({ name: '', email: '', password: '', role: DEPARTMENTS[0].role });
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  // ─── إظهار كلمة سر عامل مُعيَّن (يتطلب تأكيد هوية المدير) ──────
  const [passwordGate, setPasswordGate] = useState(null); // { workerId, value, error, submitting }
  const [revealedIds, setRevealedIds] = useState({});

  const addedWorkersKey = `addedWorkers_${user?.id || user?._id || 'guest'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(addedWorkersKey);
      setAddedWorkers(saved ? JSON.parse(saved) : []);
    } catch {
      setAddedWorkers([]);
    }
  }, [addedWorkersKey]);

  const loadInventoryFromAPI = async () => {
    try {
      const foodRes = await getFoodInventory();
      const fuelRes = await getFuelInventory();
      
      const foodItems = foodRes.data.map(item => ({
        name: item.foodType,
        كمية: item.currentStock || 0,
        متبقي: item.currentStock || 0,
        مستخدم: 0,
        threshold: item.threshold !== null && item.threshold !== undefined ? item.threshold : null,
        type: 'food'
      }));

      const fuelItems = fuelRes.data.map(item => ({
        name: item.fuelType,
        كمية: item.currentStock || 0,
        متبقي: item.currentStock || 0,
        مستخدم: 0,
        threshold: item.threshold !== null && item.threshold !== undefined ? item.threshold : null,
        type: 'fuel'
      }));

      const allItems = [...foodItems, ...fuelItems];
      setInventoryData(allItems);

      const initialInputs = {};
      allItems.forEach(item => {
        initialInputs[item.name] = item.threshold !== null ? item.threshold : '';
      });
      setThresholdInputs(initialInputs);

    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('فشل تحميل بيانات المخزون');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await loadInventoryFromAPI();
      try {
        const consumptionRes = await getFoodConsumptions(500);
        const consumptions = (consumptionRes.data || []).map(c => ({
          ...c,
          recordDate: c.recordDate ? new Date(c.recordDate).toISOString().split('T')[0] : null,
        }));
        setFoodConsumptions(consumptions);
      } catch (err) {
        console.error('Error loading consumptions:', err);
        setFoodConsumptions([]);
      }
      try {
        const response = await getMedicalRequests({ limit: 500 });
        setMedicalRequests(response?.data || []);
      } catch (err) {
        console.error('Error fetching medical requests:', err);
        setError('حدث خطأ في تحميل البيانات الطبية');
        setMedicalRequests([]);
      }
      try {
        const usersRes = await getAllUsers();
        setSystemUsers(usersRes?.data || []);
      } catch (err) {
        console.error('Error fetching system users:', err);
        setSystemUsers([]);
      }
      setIsLoading(false);
    };
    loadAll();
  }, []);

  const handleThresholdChange = (itemName, value) => {
    setThresholdInputs(prev => ({ ...prev, [itemName]: value }));
  };

  const handleSaveThreshold = async (itemName, type) => {
    const threshold = parseFloat(thresholdInputs[itemName]);
    if (isNaN(threshold) || threshold < 0) {
      alert('الرجاء إدخال قيمة صحيحة (رقم موجب)');
      return;
    }

    try {
      let response;
      if (type === 'food') {
        response = await updateFoodThreshold(itemName, threshold);
      } else if (type === 'fuel') {
        response = await updateFuelThreshold(itemName, threshold);
      }
      if (response.success) {
        alert('تم تحديث الحد الأدنى بنجاح');
        await loadInventoryFromAPI();
      }
    } catch (err) {
      alert('فشل التحديث: ' + err.message);
    }
  };

  const updateInventoryData = (consumptions, reports) => {
    const updated = inventoryData.map(item => {
      const consumed = consumptions
        .filter(c => c.feedType === item.name || c.fuelType === item.name)
        .reduce((sum, c) => sum + (parseFloat(c.dailyConsumption || c.fuelAmount || 0)), 0);
      return {
        ...item,
        مستخدم: consumed,
        متبقي: Math.max(0, (item.كمية || 0) - consumed)
      };
    });
    setInventoryData(updated);
  };

  useEffect(() => {
    if (foodConsumptions.length > 0 && inventoryData.length > 0) {
      updateInventoryData(foodConsumptions, foodRequests);
    }
  }, [foodConsumptions, foodRequests, inventoryData]);

  const getConsumptionTrend = () => {
    const byDate = {};
    foodConsumptions.forEach(c => {
      if (c.recordDate) {
        if (!byDate[c.recordDate]) {
          byDate[c.recordDate] = { total: 0, count: 0 };
        }
        byDate[c.recordDate].total += parseFloat(c.dailyConsumption) || 0;
        byDate[c.recordDate].count++;
      }
    });
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const data = byDate[dateKey];
      last7Days.push({
        name: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
        الاستهلاك: data ? Math.round(data.total / data.count) : 0,
        totalConsumption: data ? Math.round(data.total) : 0
      });
    }
    return last7Days;
  };

  const getFeedTypeDistribution = () => {
    const feedTypes = {};
    foodConsumptions.forEach(c => {
      const type = c.feedType || 'غير محدد';
      if (!feedTypes[type]) {
        feedTypes[type] = 0;
      }
      feedTypes[type] += parseFloat(c.dailyConsumption) || 0;
    });
    return Object.entries(feedTypes).map(([name, value]) => ({ name, value }));
  };

  const getPoultryDistribution = () => {
    const poultryTypes = {};
    foodConsumptions.forEach(c => {
      const type = c.poultryType || 'غير محدد';
      if (!poultryTypes[type]) {
        poultryTypes[type] = { count: 0, consumption: 0 };
      }
      poultryTypes[type].count += parseInt(c.birdCount) || 0;
      poultryTypes[type].consumption += parseFloat(c.dailyConsumption) || 0;
    });
    return Object.entries(poultryTypes).map(([name, data]) => ({
      name,
      عددالطيور: data.count,
      الاستهلاك: Math.round(data.consumption)
    }));
  };

  const getConversionRateTrend = () => {
    const validData = foodConsumptions.filter(c => c.conversionRate && c.conversionRate > 0);
    return validData.slice(-10).map((c, idx) => ({
      name: idx + 1,
      معدل_التحويل: parseFloat(c.conversionRate),
      العمر: c.averageAge
    }));
  };

  const getConsumptionByHealth = () => {
    const healthStats = {};
    foodConsumptions.forEach(c => {
      const status = c.healthStatus || 'غير محدد';
      if (!healthStats[status]) {
        healthStats[status] = { total: 0, count: 0 };
      }
      healthStats[status].total += parseFloat(c.dailyConsumption) || 0;
      healthStats[status].count++;
    });
    return Object.entries(healthStats).map(([name, data]) => ({
      name,
      متوسط_الاستهلاك: Math.round(data.total / data.count),
      totalConsumption: Math.round(data.total)
    }));
  };

  const getBatchPerformance = () => {
    const batches = {};
    foodConsumptions.forEach(c => {
      if (c.batchNumber) {
        if (!batches[c.batchNumber]) {
          batches[c.batchNumber] = {
            name: c.batchNumber,
            dailyConsumption: 0,
            birdCount: 0,
            conversionRate: 0,
            count: 0
          };
        }
        batches[c.batchNumber].dailyConsumption += parseFloat(c.dailyConsumption) || 0;
        batches[c.batchNumber].birdCount += parseInt(c.birdCount) || 0;
        if (c.conversionRate) batches[c.batchNumber].conversionRate += parseFloat(c.conversionRate);
        batches[c.batchNumber].count++;
      }
    });
    return Object.values(batches)
      .map(b => ({
        name: b.name,
        متوسط_الاستهلاك: Math.round(b.dailyConsumption / b.count),
        عدد_الطيور: b.birdCount,
        معدل_التحويل: b.conversionRate > 0 ? (b.conversionRate / b.count).toFixed(2) : 'N/A'
      }))
      .slice(0, 10);
  };

  const totalDailyConsumption = foodConsumptions.reduce((sum, c) => sum + (parseFloat(c.dailyConsumption) || 0), 0);
  const averageDailyConsumption = foodConsumptions.length > 0 ? Math.round(totalDailyConsumption / foodConsumptions.length) : 0;
  const totalBirdsFed = foodConsumptions.reduce((sum, c) => sum + (parseInt(c.birdCount) || 0), 0);
  const averageConversionRate = foodConsumptions
    .filter(c => c.conversionRate)
    .reduce((sum, c, _, arr) => sum + (parseFloat(c.conversionRate) / arr.length), 0)
    .toFixed(2);
  const monthlyProjection = averageDailyConsumption * 30;
  const weeklyProjection = averageDailyConsumption * 7;

  // توزيع القوى العاملة على الأقسام الفعلية بالاعتماد على مستخدمي النظام الحقيقيين من قاعدة البيانات
  const getDepartmentWorkforceData = () => {
    return DEPARTMENTS.map(dept => {
      const inDept = systemUsers.filter(u => u.role === dept.role);
      const available = inDept.filter(u =>
        u.isActive !== false &&
        u.lastLogin &&
        (Date.now() - new Date(u.lastLogin).getTime()) < 24 * 60 * 60 * 1000
      ).length;
      return {
        name: dept.label,
        role: dept.role,
        عدد: inDept.length,
        متاح: available,
      };
    });
  };

  const openAssignModal = () => {
    setAssignForm({ name: '', email: '', password: '', role: DEPARTMENTS[0].role });
    setAssignError('');
    setAssignStep('form');
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    if (assigning) return;
    setShowAssignModal(false);
    setAssignStep('form');
    setAssignError('');
  };

  const handleAssignChange = (field, value) => {
    setAssignForm(prev => ({ ...prev, [field]: value }));
    if (assignError) setAssignError('');
  };

  const proceedToConfirm = (e) => {
    e.preventDefault();
    if (!assignForm.name.trim()) { setAssignError('الاسم مطلوب'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assignForm.email)) { setAssignError('البريد الإلكتروني غير صالح'); return; }
    if (assignForm.password.length < 8) { setAssignError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    setAssignError('');
    setAssignStep('confirm');
  };

  const confirmAssignWorker = async () => {
    setAssigning(true);
    setAssignError('');
    try {
      const res = await signup({
        name: assignForm.name.trim(),
        email: assignForm.email.trim().toLowerCase(),
        password: assignForm.password,
        role: assignForm.role,
      });
      if (res.success) {
        const dept = DEPARTMENTS.find(d => d.role === assignForm.role);
        const newWorker = {
          id: res.data.id,
          name: assignForm.name.trim(),
          email: assignForm.email.trim().toLowerCase(),
          password: assignForm.password,
          role: assignForm.role,
          department: dept?.label || assignForm.role,
          addedAt: Date.now(),
        };
        const updated = [newWorker, ...addedWorkers];
        setAddedWorkers(updated);
        try { localStorage.setItem(addedWorkersKey, JSON.stringify(updated)); } catch { /* التخزين المحلي غير متاح */ }

        toast.success('تم تعيين العامل بنجاح، يمكنه الآن الدخول من واجهة تسجيل الدخول بنفس البيانات');
        setShowAssignModal(false);
        setAssignStep('form');

        try {
          const usersRes = await getAllUsers();
          setSystemUsers(usersRes?.data || []);
        } catch { /* لا داعي لإفشال العملية إن تعذّر تحديث الإحصائيات فوراً */ }
      }
    } catch (err) {
      setAssignError(err.message || 'فشل تعيين العامل');
    } finally {
      setAssigning(false);
    }
  };

  const requestReveal = (workerId) => {
    setPasswordGate({ workerId, value: '', error: '', submitting: false });
  };

  const cancelReveal = () => setPasswordGate(null);

  const hidePassword = (workerId) => {
    setRevealedIds(prev => {
      const next = { ...prev };
      delete next[workerId];
      return next;
    });
  };

  const submitReveal = async (e) => {
    e.preventDefault();
    if (!passwordGate || !user?.email) return;
    setPasswordGate(prev => ({ ...prev, submitting: true, error: '' }));
    try {
      await api.post('/auth/login', { email: user.email, password: passwordGate.value });
      setRevealedIds(prev => ({ ...prev, [passwordGate.workerId]: true }));
      setPasswordGate(null);
    } catch {
      setPasswordGate(prev => ({ ...prev, submitting: false, error: 'كلمة السر غير صحيحة' }));
    }
  };

  // نشاط تسجيل الدخول لآخر 7 أيام بالاعتماد على lastLogin الفعلي لكل مستخدم في قاعدة البيانات
  const getEmployeeActivityData = () => {
    const activityByDay = {};
    systemUsers.forEach(u => {
      if (u.lastLogin) {
        const dateKey = new Date(u.lastLogin).toLocaleDateString('ar-EG');
        activityByDay[dateKey] = (activityByDay[dateKey] || 0) + 1;
      }
    });
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('ar-EG');
      last7Days.push({
        name: date.toLocaleDateString('ar-EG', { weekday: 'short' }),
        تسجيل_دخول: activityByDay[dateKey] || 0
      });
    }
    return last7Days;
  };

  // توزيع كل مستخدمي النظام المسجّلين فعلياً في قاعدة البيانات حسب الدور
  const getRoleDistributionData = () => {
    const roleCount = {};
    systemUsers.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] || 0) + 1;
    });
    return Object.entries(roleCount).map(([role, count]) => ({
      name: ROLE_NAMES[role] || role,
      value: count,
      role
    }));
  };

  const activeUsersCount = systemUsers.filter(
    u => u.lastLogin && (Date.now() - new Date(u.lastLogin).getTime()) < 24 * 60 * 60 * 1000
  ).length;

  const getTreatmentBreakdown = () => {
    const counts = {};
    medicalRequests.forEach(r => {
      const t = r.treatmentType || 'أخرى';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }));
  };

  const getPriorityBreakdown = () => {
    const PRIORITY_COLORS = { 'عاجل': '#EF4444', 'مرتفع': '#F59E0B', 'متوسط': '#3B82F6', 'منخفض': '#10B981' };
    const map = { 'عاجل': 0, 'مرتفع': 0, 'متوسط': 0, 'منخفض': 0 };
    medicalRequests.forEach(r => {
      if (r.priority && map[r.priority] !== undefined) {
        map[r.priority]++;
      }
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name]
    }));
  };

  const getRequestsTrend = () => {
    const byDate = {};
    medicalRequests.forEach(r => {
      if (r.requestDate) {
        byDate[r.requestDate] = (byDate[r.requestDate] || 0) + 1;
      }
    });
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      return {
        name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        الطلبات: byDate[key] || 0
      };
    });
  };

  const getMedicationData = () => {
    const stats = {};
    medicalRequests.forEach(r => {
      const med = r.medicationName || r.treatmentType || 'غير محدد';
      if (!stats[med]) {
        stats[med] = {
          name: med,
          عددالطلبات: 0,
          اجماليالطيور: 0,
          اجماليالمصابين: 0,
          اجماليالنافق: 0
        };
      }
      stats[med].عددالطلبات++;
      stats[med].اجماليالطيور += parseInt(r.birdCount) || 0;
      stats[med].اجماليالمصابين += parseInt(r.affectedCount) || 0;
      stats[med].اجماليالنافق += parseInt(r.mortalityCount) || 0;
    });
    return Object.values(stats);
  };

  const getPoultryTypeBreakdown = () => {
    const counts = {};
    medicalRequests.forEach(r => {
      const t = r.poultryType || 'أخرى';
      counts[t] = (counts[t] || 0) + (parseInt(r.birdCount) || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getSymptomsData = () => {
    const symptomsList = {};
    medicalRequests.forEach(r => {
      if (r.symptoms) {
        const symptoms = r.symptoms.split(/[،,;\n]/);
        symptoms.forEach(symptom => {
          const cleanSymptom = symptom.trim();
          if (cleanSymptom) {
            symptomsList[cleanSymptom] = (symptomsList[cleanSymptom] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(symptomsList)
      .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const totalMedicalBirds = medicalRequests.reduce((s, r) => s + (parseInt(r.birdCount) || 0), 0);
  const totalAffected = medicalRequests.reduce((s, r) => s + (parseInt(r.affectedCount) || 0), 0);
  const totalMortality = medicalRequests.reduce((s, r) => s + (parseInt(r.mortalityCount) || 0), 0);
  const urgentCount = medicalRequests.filter(r => r.priority === 'عاجل' || r.priority === 'مرتفع').length;
  const mortalityRate = totalMedicalBirds > 0 ? ((totalMortality / totalMedicalBirds) * 100).toFixed(1) : 0;
  const affectedRate = totalMedicalBirds > 0 ? ((totalAffected / totalMedicalBirds) * 100).toFixed(1) : 0;
  const getRecentRequests = () => [...medicalRequests].reverse().slice(0, 5);

  const feedTotals = {
    كمية: inventoryData.reduce((s, i) => s + (i?.كمية || 0), 0),
    متبقي: inventoryData.reduce((s, i) => s + (i?.متبقي || 0), 0),
    مستخدم: inventoryData.reduce((s, i) => s + (i?.مستخدم || 0), 0),
  };
  const consumptionRate = feedTotals.كمية > 0 ? Math.round((feedTotals.مستخدم / feedTotals.كمية) * 100) : 0;

  const departmentWorkforceData = getDepartmentWorkforceData();
  const workersTotals = {
    عدد: departmentWorkforceData.reduce((sum, item) => sum + item.عدد, 0),
    متاح: departmentWorkforceData.reduce((sum, item) => sum + item.متاح, 0)
  };

  // فلترة العمال المُعيَّنين من هذه الصفحة حسب الاسم أو البريد
  const filteredAddedWorkers = addedWorkers.filter(w => {
    const q = workersSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (w.name || '').toLowerCase().includes(q) ||
      (w.email || '').toLowerCase().includes(q)
    );
  });

  // فلترة كل مستخدمي النظام حسب الاسم أو البريد (تُستخدم في تبويب النشاط)
  const filteredSystemUsers = systemUsers.filter(u => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  const equipmentData = [
    { name: 'معالف', كمية: 50, معطوب: 2 },
    { name: 'مساقي', كمية: 50, معطوب: 3 },
    { name: 'دفايات', كمية: 10, معطوب: 0 },
  ];
  const equipmentTotals = {
    كمية: equipmentData.reduce((s, i) => s + i.كمية, 0),
    معطوب: equipmentData.reduce((s, i) => s + i.معطوب, 0)
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-right">تخطيط الموارد</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-right">
          {error}
        </div>
      )}

      <div className="flex flex-wrap justify-end mb-6 border-b border-gray-200">
        <button className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${activeTab === 'feed' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('feed')}>الأعلاف</button>
        <button className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${activeTab === 'vaccine' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('vaccine')}>الطلبات الطبية</button>
        <button className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${activeTab === 'equipment' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('equipment')}>المعدات</button>
        <button className={`px-4 py-2 font-medium text-sm rounded-t-lg mr-2 ${activeTab === 'workers' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('workers')}>العمالة</button>
        <button className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'activity' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveTab('activity')}>نشاط الموظفين</button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">

        {/* ═══════════════════ FEED TAB ═══════════════════ */}
        {activeTab === 'feed' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">تخطيط الأعلاف والمخزون</h2>
              <button onClick={() => navigate('/food-consumption')} className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md">
                تسجيل استهلاك
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="متوسط الاستهلاك اليومي" value={`${averageDailyConsumption.toLocaleString()} كجم`} icon="📊" />
              <StatCard title="الاستهلاك اليومي الإجمالي" value={`${totalDailyConsumption.toLocaleString()} كجم`} icon="🌾" />
              <StatCard title="إجمالي الطيور المغذاة" value={totalBirdsFed.toLocaleString()} icon="🐔" />
              <StatCard title="معدل تحويل العلف" value={averageConversionRate} icon="📈" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="الإسقاط الشهري" value={`${monthlyProjection.toLocaleString()} كجم`} icon="📅" />
              <StatCard title="الإسقاط الأسبوعي" value={`${weeklyProjection.toLocaleString()} كجم`} icon="📆" />
              <StatCard title="عدد سجلات الاستهلاك" value={foodConsumptions.length} icon="📝" />
            </div>

            {getConsumptionTrend().length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">اتجاه الاستهلاك اليومي (آخر 7 أيام)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getConsumptionTrend()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="الاستهلاك" stroke="#8884d8" name="متوسط الاستهلاك (كجم)" />
                      <Line type="monotone" dataKey="totalConsumption" stroke="#82ca9d" name="إجمالي الاستهلاك (كجم)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {getFeedTypeDistribution().length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">توزيع الاستهلاك حسب نوع العلف</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getFeedTypeDistribution()}
                          cx="50%" cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {getFeedTypeDistribution().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">الاستهلاك حسب الحالة الصحية</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getConsumptionByHealth()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="متوسط_الاستهلاك" fill="#F59E0B" name="متوسط الاستهلاك (كجم)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {getPoultryDistribution().length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">توزيع الاستهلاك حسب نوع الدواجن</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPoultryDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="الاستهلاك" fill="#3B82F6" name="الاستهلاك الكلي (كجم)" />
                      <Bar dataKey="عددالطيور" fill="#10B981" name="عدد الطيور" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {getConversionRateTrend().length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">اتجاه معدل تحويل العلف</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getConversionRateTrend()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" label={{ value: 'رقم التسجيل', position: 'insideBottom' }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="معدل_التحويل" stroke="#EF4444" name="معدل تحويل العلف" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* جدول المخزون مع الحد الأدنى */}
            {inventoryData.length > 0 && (
              <div className="mb-8 overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">المخزون الحالي والحد الأدنى</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع المادة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المخزون الحالي</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحد الأدنى</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراء</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.كمية}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            value={thresholdInputs[item.name] || ''}
                            onChange={(e) => handleThresholdChange(item.name, e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                            placeholder="حد أدنى"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSaveThreshold(item.name, item.type)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                          >
                            حفظ
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.threshold !== null && item.كمية <= item.threshold ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              ⚠️ منخفض
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✔️ جيد
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {inventoryData.length > 0 && (
              <div className="h-80 mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">مخزون الأعلاف حسب النوع</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="كمية" fill="#8884d8" name="الكمية الكلية" />
                    <Bar dataKey="مستخدم" fill="#FF8042" name="المستخدم" />
                    <Bar dataKey="متبقي" fill="#82ca9d" name="المتبقي" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {getBatchPerformance().length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">أداء الدفعات</h3>
                <ResourceTable data={getBatchPerformance()} columns={[
                  { header: 'رقم الدفعة', key: 'name' },
                  { header: 'متوسط الاستهلاك اليومي (كجم)', key: 'متوسط_الاستهلاك' },
                  { header: 'عدد الطيور', key: 'عدد_الطيور' },
                  { header: 'معدل تحويل العلف', key: 'معدل_التحويل' },
                ]} />
              </div>
            )}

            <ResourceTable data={inventoryData} columns={[
              { header: 'نوع العلف', key: 'name' },
              { header: 'الكمية الكلية (كجم)', key: 'كمية' },
              { header: 'المستخدم (كجم)', key: 'مستخدم' },
              { header: 'المتبقي (كجم)', key: 'متبقي' },
              { header: 'معدل الاستهلاك', key: 'rate', render: (item) => `${item.كمية > 0 ? Math.round((item.مستخدم / item.كمية) * 100) : 0}%` },
            ]} />

            {foodConsumptions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">آخر سجلات استهلاك الغذاء</h3>
                <div className="space-y-2">
                  {[...foodConsumptions].reverse().slice(0, 5).map((consumption, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">
                          {consumption.feedType} - {consumption.poultryType}
                        </div>
                        <div className="text-sm text-gray-600">
                          الدفعة: {consumption.batchNumber} | العمر: {consumption.averageAge} يوم
                        </div>
                        {consumption.notes && (
                          <div className="text-xs text-gray-500">ملاحظات: {consumption.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-orange-600">
                          الاستهلاك: {consumption.dailyConsumption} كجم/يوم
                        </div>
                        <div className="text-sm text-gray-600">عدد الطيور: {consumption.birdCount}</div>
                        <div className="text-xs text-gray-400">{consumption.recordDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {foodConsumptions.length === 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-800">لا توجد سجلات استهلاك حتى الآن. قم بتسجيل استهلاك جديد باستخدام الزر أعلاه.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ VACCINE TAB ═══════════════════ */}
        {activeTab === 'vaccine' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">الطلبات الطبية البيطرية</h2>
              <button onClick={() => navigate('/medication-requests')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">تقديم طلب طبي جديد</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard title="إجمالي الطلبات" value={medicalRequests.length} icon="📋" />
              <StatCard title="إجمالي الطيور" value={totalMedicalBirds.toLocaleString()} icon="🐔" />
              <StatCard title="الطلبات العاجلة/المرتفعة" value={urgentCount} icon="🚨" />
              <StatCard title="نسبة النافق" value={`${mortalityRate}%`} icon="📉" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatCard title="إجمالي المصابين" value={totalAffected.toLocaleString()} icon="🤒" />
              <StatCard title="نسبة الإصابة" value={`${affectedRate}%`} icon="📊" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">توزيع أنواع العلاج</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTreatmentBreakdown()}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {getTreatmentBreakdown().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">توزيع الأولويات</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPriorityBreakdown()}
                        cx="50%" cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {getPriorityBreakdown().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">اتجاه الطلبات (آخر 7 أيام)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getRequestsTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="الطلبات" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="عدد الطلبات" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">الأدوية والعلاجات المستخدمة</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMedicationData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="عددالطلبات" fill="#3B82F6" name="عدد الطلبات" />
                    <Bar dataKey="اجماليالطيور" fill="#10B981" name="إجمالي الطيور" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">توزيع الطيور حسب النوع</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPoultryTypeBreakdown()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="عدد الطيور">
                      {getPoultryTypeBreakdown().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {getSymptomsData().length > 0 && (
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">الأعراض الأكثر شيوعاً</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSymptomsData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#F59E0B" name="عدد الطلبات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="mt-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">آخر الطلبات الطبية</h3>
              <div className="space-y-2">
                {getRecentRequests().map((req, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{req.facilityName} — {req.ownerName}</div>
                      <div className="text-sm text-gray-600">
                        الدواء: {req.medicationName} | نوع العلاج: {req.treatmentType}
                      </div>
                      <div className="text-sm text-gray-600">
                        نوع الدواجن: {req.poultryType} | طريقة الإعطاء: {req.administrationMethod}
                      </div>
                      {req.symptoms && (
                        <div className="text-sm text-gray-500">الأعراض: {req.symptoms.substring(0, 50)}...</div>
                      )}
                    </div>
                    <div className="text-right shrink-0 mr-4">
                      <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full mb-1 ${
                        req.priority === 'عاجل' ? 'bg-red-100 text-red-700' :
                        req.priority === 'مرتفع' ? 'bg-orange-100 text-orange-700' :
                        req.priority === 'متوسط' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>{req.priority}</span>
                      <div className="text-sm text-gray-600">عدد الطيور: {parseInt(req.birdCount || 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">المصاب: {req.affectedCount || 0} | النافق: {req.mortalityCount || 0}</div>
                      <div className="text-xs text-gray-400">{req.requestDate}</div>
                    </div>
                  </div>
                ))}
                {medicalRequests.length === 0 && !error && (
                  <div className="text-center py-8 text-gray-500">لا توجد طلبات طبية حتى الآن</div>
                )}
              </div>
            </div>

            <ResourceTable data={medicalRequests} columns={[
              { header: 'المنشأة', key: 'facilityName' },
              { header: 'اسم المالك', key: 'ownerName' },
              { header: 'نوع الدواجن', key: 'poultryType' },
              { header: 'عدد الطيور', key: 'birdCount' },
              { header: 'المصاب', key: 'affectedCount' },
              { header: 'النافق', key: 'mortalityCount' },
              { header: 'نوع العلاج', key: 'treatmentType' },
              { header: 'الدواء', key: 'medicationName' },
              { header: 'الأولوية', key: 'priority' },
              { header: 'التاريخ', key: 'requestDate' },
            ]} />
          </div>
        )}

        {/* ═══════════════════ EQUIPMENT TAB ═══════════════════ */}
        {activeTab === 'equipment' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">تخطيط المعدات</h2>
              <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md">طلب معدات جديدة</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="إجمالي المعدات" value={equipmentTotals.كمية} icon="⚙️" />
              <StatCard title="المعدات المعطوبة" value={equipmentTotals.معطوب} icon="⚠️" />
              <StatCard title="نسبة الصلاحية" value={`${Math.round(((equipmentTotals.كمية - equipmentTotals.معطوب) / equipmentTotals.كمية) * 100)}%`} icon="🛠️" />
            </div>
            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equipmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="كمية" fill="#8B5CF6" name="الكمية الكلية" />
                  <Bar dataKey="معطوب" fill="#F59E0B" name="المعطوب" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ResourceTable data={equipmentData} columns={[
              { header: 'نوع المعدة', key: 'name' },
              { header: 'الكمية الكلية', key: 'كمية' },
              { header: 'المعطوب', key: 'معطوب' },
            ]} />
          </div>
        )}

        {/* ═══════════════════ WORKERS TAB ═══════════════════ */}
        {activeTab === 'workers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">تخطيط العمالة</h2>
              <button onClick={openAssignModal} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md">تعيين عامل جديد</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="إجمالي العمالة" value={workersTotals.عدد} icon="👷" />
              <StatCard title="المتاح حالياً" value={workersTotals.متاح} icon="✅" />
              <StatCard title="نسبة التواجد" value={`${workersTotals.عدد > 0 ? Math.round((workersTotals.متاح / workersTotals.عدد) * 100) : 0}%`} icon="📊" />
            </div>
            {user && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-md font-semibold text-blue-800 mb-2">المستخدم الحالي</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">الاسم: {user.name}</span>
                  <span className="text-gray-700">الدور: {
                    user.role === 'admin' ? 'مدير' :
                    user.role === 'manager' ? 'مشرف' : 'موظف'
                  }</span>
                </div>
              </div>
            )}
            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentWorkforceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="عدد" fill="#F59E0B" name="العدد الكلي" />
                  <Bar dataKey="متاح" fill="#10B981" name="المتاح" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ResourceTable
              data={departmentWorkforceData}
              columns={[
                { header: 'القسم', key: 'name' },
                { header: 'العدد الكلي', key: 'عدد' },
                { header: 'المتاح', key: 'متاح' },
                { header: 'نسبة التواجد', key: 'attendance', render: (item) => `${item.عدد > 0 ? Math.round((item.متاح / item.عدد) * 100) : 0}%` },
              ]}
            />

            {addedWorkers.length > 0 && (
              <div className="mt-8">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-700">
                    العمال الذين تم تعيينهم من هذه الصفحة
                  </h3>
                  <input
                    type="text"
                    value={workersSearch}
                    onChange={(e) => setWorkersSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد..."
                    className="w-full sm:w-72 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {filteredAddedWorkers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    لا يوجد عامل مطابق لـ «{workersSearch}»
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAddedWorkers.map((w) => (
                      <div key={w.id} className="flex flex-wrap justify-between items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{w.name}</div>
                          <div className="text-sm text-gray-600">{w.email}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div>القسم: {w.department}</div>
                          <div>الدور: {ROLE_NAMES[w.role] || w.role}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-800 min-w-[6rem] text-center">
                            {revealedIds[w.id] ? w.password : '••••••••'}
                          </span>
                          {revealedIds[w.id] ? (
                            <button
                              onClick={() => hidePassword(w.id)}
                              className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                            >
                              إخفاء
                            </button>
                          ) : (
                            <button
                              onClick={() => requestReveal(w.id)}
                              className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                            >
                              إظهار كلمة السر
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  * تُحفظ هذه القائمة على جهازك فقط. لا يمكن استرجاع كلمات السر من قاعدة البيانات لاحقاً لأنها تُخزَّن بشكل مشفّر لا رجعة فيه، لذلك يُطلب تأكيد كلمة سر حسابك لعرضها هنا كطبقة حماية إضافية.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ ACTIVITY TAB ═══════════════════ */}
        {activeTab === 'activity' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">نشاط الموظفين</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="إجمالي المستخدمين في النظام" value={systemUsers.length} icon="👥" />
              <StatCard title="نشطون خلال آخر 24 ساعة" value={activeUsersCount} icon="✅" />
              <StatCard title="نسبة النشاط" value={`${systemUsers.length > 0 ? Math.round((activeUsersCount / systemUsers.length) * 100) : 0}%`} icon="📊" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">توزيع الموظفين حسب الدور</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getRoleDistributionData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getRoleDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-4 text-center">نشاط تسجيل الدخول (آخر 7 أيام)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getEmployeeActivityData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="تسجيل_دخول" fill="#8884d8" name="عدد تسجيلات الدخول" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* جدول بحث المستخدمين */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                <h3 className="text-md font-semibold text-gray-700">البحث في المستخدمين</h3>
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="ابحث بالاسم أو البريد..."
                  className="w-full sm:w-72 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {filteredSystemUsers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  لا يوجد مستخدم مطابق لـ «{activitySearch}»
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">آخر تسجيل دخول</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSystemUsers.map((u) => (
                        <tr key={u.id || u._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ROLE_NAMES[u.role] || u.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('ar-EG') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activitySearch.trim() && (
                <p className="text-xs text-gray-500 mt-2">
                  عدد النتائج: {filteredSystemUsers.length} من أصل {systemUsers.length}
                </p>
              )}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-semibold text-gray-700 mb-3">ملخص النشاط</h3>
              <div className="space-y-2">
                <p>• إجمالي عدد المستخدمين المسجّلين في النظام: {systemUsers.length}</p>
                <p>• المستخدمون النشطون خلال آخر 24 ساعة: {activeUsersCount}</p>
                <p>• عدد تسجيلات الدخول اليوم: {getEmployeeActivityData().slice(-1)[0]?.تسجيل_دخول || 0}</p>
                <p>• متوسط تسجيلات الدخول اليومي (آخر 7 أيام): {Math.round(getEmployeeActivityData().reduce((sum, day) => sum + day.تسجيل_دخول, 0) / 7)}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ═══════════ مودال تعيين عامل جديد ═══════════ */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeAssignModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
            {assignStep === 'form' ? (
              <>
                <h3 className="font-bold text-gray-800 text-lg mb-1">تعيين عامل جديد</h3>
                <p className="text-sm text-gray-500 mb-4">
                  سيتمكن العامل من تسجيل الدخول لاحقاً بهذا البريد وكلمة السر مباشرة من واجهة تسجيل الدخول، دون الحاجة لإنشاء حساب بنفسه.
                </p>
                <form onSubmit={proceedToConfirm} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      value={assignForm.name}
                      onChange={(e) => handleAssignChange('name', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={assignForm.email}
                      onChange={(e) => handleAssignChange('email', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
                    <input
                      type="text"
                      value={assignForm.password}
                      onChange={(e) => handleAssignChange('password', e.target.value)}
                      placeholder="8 أحرف على الأقل"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">القسم</label>
                    <select
                      value={assignForm.role}
                      onChange={(e) => handleAssignChange('role', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.role} value={d.role}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  {assignError && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{assignError}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={closeAssignModal} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                      إلغاء
                    </button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold">
                      التالي
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="font-bold text-gray-800 text-lg mb-1">تأكيد تعيين العامل</h3>
                <p className="text-sm text-gray-500 mb-4">
                  تحقق من البيانات قبل التعيين — سيتمكن هذا الشخص من الدخول فوراً بهذه البيانات.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 mb-4">
                  <p><span className="text-gray-500">الاسم:</span> <span className="font-semibold">{assignForm.name}</span></p>
                  <p><span className="text-gray-500">البريد:</span> <span className="font-semibold">{assignForm.email}</span></p>
                  <p><span className="text-gray-500">القسم:</span> <span className="font-semibold">{DEPARTMENTS.find(d => d.role === assignForm.role)?.label}</span></p>
                </div>
                {assignError && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{assignError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignStep('form')}
                    disabled={assigning}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    رجوع
                  </button>
                  <button
                    type="button"
                    onClick={confirmAssignWorker}
                    disabled={assigning}
                    className="flex-1 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {assigning ? 'جارٍ التعيين...' : 'تأكيد التعيين'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ مودال تأكيد الهوية لإظهار كلمة سر عامل ═══════════ */}
      {passwordGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) cancelReveal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" dir="rtl">
            <h3 className="font-bold text-gray-800 mb-1">تأكيد الهوية</h3>
            <p className="text-sm text-gray-500 mb-4">
              لعرض كلمة السر، أدخل كلمة سر حسابك الحالي — هذا يحميك في حال كان حسابك مفتوحاً على جهاز غير موثوق.
            </p>
            <form onSubmit={submitReveal} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={passwordGate.value}
                onChange={(e) => setPasswordGate(prev => ({ ...prev, value: e.target.value, error: '' }))}
                placeholder="كلمة سر حسابك"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {passwordGate.error && <p className="text-xs text-red-600">{passwordGate.error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={cancelReveal} className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={passwordGate.submitting || !passwordGate.value}
                  className="flex-1 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {passwordGate.submitting ? 'جارٍ التحقق...' : 'تأكيد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-start">
      <div className="text-2xl">{icon}</div>
      <div className="text-right">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const ResourceTable = ({ data, columns }) => {
  if (!data || data.length === 0)
    return <div className="text-center py-8 text-gray-500">لا توجد بيانات لعرضها</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourcePlanning;