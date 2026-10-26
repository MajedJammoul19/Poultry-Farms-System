import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

const ActivityRecords = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuantity: 0,
    rejectionRate: 0,
    qualityRate: 0
  });

  // جلب البيانات من الـ API
  useEffect(() => {
    fetchOperations();
  }, [timeRange]);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      // جلب البيانات حسب الفترة الزمنية
      let dateFilter = {};
      const now = new Date();
      
      if (timeRange === 'day') {
        dateFilter = { $gte: new Date(now.setHours(0,0,0,0)) };
      } else if (timeRange === 'week') {
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      } else if (timeRange === 'month') {
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
      }
      
      const response = await axios.get('http://localhost:5000/api/packing-operations');
      
      if (response.data.success) {
        let filteredOps = response.data.data;
        
        // فلترة حسب التاريخ
        if (dateFilter.$gte) {
          filteredOps = filteredOps.filter(op => new Date(op.sortingDate) >= dateFilter.$gte);
        }
        
        setOperations(filteredOps);
        calculateStats(filteredOps);
      }
    } catch (error) {
      console.error("Error fetching operations:", error);
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const calculateStats = (ops) => {
    const totalQty = ops.reduce((sum, op) => sum + op.totalQuantity, 0);
    const totalRejected = ops.reduce((sum, op) => sum + op.rejected, 0);
    const totalGradeA = ops.reduce((sum, op) => sum + op.gradeA, 0);
    const totalGradeB = ops.reduce((sum, op) => sum + op.gradeB, 0);
    
    setStats({
      totalQuantity: totalQty,
      rejectionRate: totalQty > 0 ? ((totalRejected / totalQty) * 100).toFixed(1) : 0,
      qualityRate: totalQty > 0 ? (((totalGradeA + totalGradeB) / totalQty) * 100).toFixed(1) : 0
    });
  };

  // تحضير بيانات إنتاج البيض (المنتجات المعبأة)
  const eggProductionData = operations.map(op => {
    const date = new Date(op.sortingDate).toLocaleDateString('ar-EG');
    const productionRate = ((op.gradeA + op.gradeB + op.gradeC) / op.totalQuantity * 100).toFixed(1);
    return {
      name: date,
      إنتاج: parseFloat(productionRate),
      سعة: 100,
      الكمية: op.totalQuantity
    };
  }).slice(-7); // آخر 7 عمليات

  // تحضير بيانات الفاقد (المنتجات المرفوضة)
  const lossData = operations.map(op => {
    const date = new Date(op.sortingDate).toLocaleDateString('ar-EG');
    const rejectedRate = (op.rejected / op.totalQuantity * 100).toFixed(1);
    return {
      name: date,
      مرفوض: op.rejected,
      نسبة_الرفض: parseFloat(rejectedRate)
    };
  }).slice(-7); // آخر 7 عمليات

  // حساب المتوسطات
  const avgRejectionRate = operations.length > 0 
    ? (operations.reduce((sum, op) => sum + (op.rejected / op.totalQuantity * 100), 0) / operations.length).toFixed(1)
    : 0;
  
  const totalProduction = operations.reduce((sum, op) => sum + op.totalQuantity, 0);
  const totalRejected = operations.reduce((sum, op) => sum + op.rejected, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-right">
        📊 سجلات عمليات الفرز والتعبئة
      </h1>
      
      {/* فلترة البيانات */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-purple-100 p-3 rounded-lg">
          <p className="text-sm text-purple-700">إجمالي العمليات: {operations.length}</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="day">آخر يوم</option>
          <option value="week">آخر 7 أيام</option>
          <option value="month">آخر 30 يوم</option>
        </select>
      </div>

      {/* بطاقات الإحصائيات (مبسطة) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="text-3xl">📦</div>
            <div className="text-right">
              <h3 className="text-sm opacity-90">إجمالي المنتجات</h3>
              <p className="text-2xl font-bold mt-1">{totalProduction.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="text-3xl">✅</div>
            <div className="text-right">
              <h3 className="text-sm opacity-90">نسبة الجودة العالية (A+B)</h3>
              <p className="text-2xl font-bold mt-1">{stats.qualityRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="text-3xl">⚠️</div>
            <div className="text-right">
              <h3 className="text-sm opacity-90">نسبة الرفض</h3>
              <p className="text-2xl font-bold mt-1">{stats.rejectionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* الرسم البياني الأول: إنتاج المنتجات (مشابه لإنتاج البيض) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-right">
          🥚 نسبة إنتاج المنتجات المعبأة
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eggProductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="إنتاج" fill="#8884d8" name="نسبة الإنتاج (%)" />
              <Bar dataKey="سعة" fill="#82ca9d" name="السعة المستهدفة (%)" opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-right text-sm text-gray-600">
          <p>متوسط نسبة الإنتاج: {eggProductionData.length > 0 
            ? (eggProductionData.reduce((sum, d) => sum + d.إنتاج, 0) / eggProductionData.length).toFixed(1)
            : 0}%
          </p>
        </div>
      </div>

      {/* الرسم البياني الثاني: نسبة الفاقد (المنتجات المرفوضة) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-right">
          ⚠️ نسبة المنتجات المرفوضة (الفاقد)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="نسبة_الرفض" stroke="#EF4444" strokeWidth={2} name="نسبة الرفض (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-right text-sm text-gray-600">
          <p>إجمالي المنتجات المرفوضة: {totalRejected.toLocaleString()} قطعة</p>
          <p>متوسط نسبة الرفض: {avgRejectionRate}%</p>
        </div>
      </div>

      {/* جدول ملخص العمليات */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-700 p-6 pb-0 text-right">
          📋 آخر العمليات
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المشغل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الجودة العالية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرفض</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.slice(0, 10).map((op) => {
                const highQuality = ((op.gradeA + op.gradeB) / op.totalQuantity * 100).toFixed(1);
                return (
                  <tr key={op._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(op.sortingDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{op.operatorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{op.productType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{op.totalQuantity.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {highQuality}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {op.rejected} قطعة
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {operations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد عمليات فرز وتعبئة حتى الآن
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityRecords;