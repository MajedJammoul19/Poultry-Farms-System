import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FoodConsumptionReports = () => {
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [filters, setFilters] = useState({
    poultryType: "",
    batchNumber: "",
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });
  const [showStats, setShowStats] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchConsumptions();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchConsumptions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.poultryType) queryParams.append("poultryType", filters.poultryType);
      if (filters.batchNumber) queryParams.append("batchNumber", filters.batchNumber);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      queryParams.append("page", pagination.page);
      queryParams.append("limit", 10);

      const response = await axios.get(
        `http://localhost:5000/api/food-consumption?${queryParams}`
      );

      if (response.data.success) {
        setConsumptions(response.data.data);
        setPagination({
          page: response.data.page,
          total: response.data.total,
          pages: response.data.pages
        });
      }
    } catch (error) {
      console.error("Error fetching consumptions:", error);
      showMessage("error", "حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/food-consumption/stats/summary"
      );
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPredictions = async () => {
    setShowPredictions(!showPredictions);
    if (!showPredictions && !predictions) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/food-consumption/predict/future?days=30&poultryType=${filters.poultryType || "all"}`
        );
        if (response.data.success) {
          setPredictions(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
        showMessage("error", "حدث خطأ أثناء جلب التوقعات");
      }
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      poultryType: "",
      batchNumber: "",
      startDate: "",
      endDate: ""
    });
    setPagination({ page: 1, total: 0, pages: 0 });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // عنوان التقرير
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("تقارير استهلاك الغذاء", 105, 15, { align: "center" });
    
    // تاريخ التقرير
    doc.setFontSize(10);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`, 105, 25, { align: "center" });
    
    // إعداد بيانات الجدول
    const tableData = consumptions.map(con => [
      con.batchNumber,
      con.poultryType,
      con.dailyConsumption,
      con.weeklyConsumption || (con.dailyConsumption * 7),
      con.monthlyConsumption || (con.dailyConsumption * 30),
      con.birdCount,
      con.averageAge,
      con.feedType,
      con.conversionRate || "-",
      new Date(con.recordDate).toLocaleDateString("ar-EG")
    ]);
    
    const tableHeaders = [
      "رقم الدفعة",
      "نوع الدواجن",
      "يومي (كجم)",
      "أسبوعي (كجم)",
      "شهري (كجم)",
      "عدد الطيور",
      "العمر (يوم)",
      "نوع العلف",
      "معدل التحويل",
      "التاريخ"
    ];
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 35,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "right",
        font: "helvetica"
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
        halign: "right"
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    doc.save(`تقارير_استهلاك_الغذاء_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    const headers = [
      "رقم الدفعة",
      "نوع الدواجن",
      "التاريخ",
      "الاستهلاك اليومي (كجم)",
      "الاستهلاك الأسبوعي (كجم)",
      "الاستهلاك الشهري (كجم)",
      "عدد الطيور",
      "متوسط العمر (يوم)",
      "نوع العلف",
      "ماركة العلف",
      "معدل التحويل",
      "تكلفة العلف",
      "درجة الحرارة",
      "الحالة الصحية",
      "الملاحظات"
    ];
    
    const csvData = consumptions.map(con => [
      con.batchNumber,
      con.poultryType,
      new Date(con.recordDate).toLocaleDateString("ar-EG"),
      con.dailyConsumption,
      con.weeklyConsumption || (con.dailyConsumption * 7),
      con.monthlyConsumption || (con.dailyConsumption * 30),
      con.birdCount,
      con.averageAge,
      con.feedType,
      con.feedBrand || "",
      con.conversionRate || "",
      con.feedCost || "",
      con.temperature || "",
      con.healthStatus || "",
      con.notes || ""
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `استهلاك_الغذاء_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPoultryTypeColor = (type) => {
    switch(type) {
      case "صيصان": return "bg-blue-100 text-blue-800";
      case "دجاج لاحم": return "bg-red-100 text-red-800";
      case "دجاج بياض": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthStatusColor = (status) => {
    switch(status) {
      case "ممتاز": return "bg-green-100 text-green-800";
      case "جيد": return "bg-blue-100 text-blue-800";
      case "متوسط": return "bg-yellow-100 text-yellow-800";
      case "ضعيف": return "bg-orange-100 text-orange-800";
      case "حرج": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const poultryTypes = ["صيصان", "دجاج لاحم", "دجاج بياض"];

  return (
    <div className="container mx-auto p-6">
      {/* رسائل التنبيه */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg text-right ${
          message.type === "success" 
            ? "bg-green-100 text-green-700 border border-green-400" 
            : "bg-red-100 text-red-700 border border-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* الهيدر */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              📄 PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              📊 Excel
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              {showStats ? "إخفاء الإحصائيات" : "عرض الإحصائيات"}
            </button>
            <button
              onClick={fetchPredictions}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
            >
              {showPredictions ? "إخفاء التوقعات" : "🔮 توقعات المستقبل"}
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white text-right">
            📊 تقارير استهلاك الغذاء
          </h1>
        </div>
      </div>

      {/* الإحصائيات */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalRecords || 0}</div>
              <div className="text-sm mt-1">إجمالي السجلات</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{Math.round(stats.totalDailyConsumption || 0).toLocaleString()}</div>
              <div className="text-sm mt-1">إجمالي الاستهلاك اليومي (كجم)</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.averageConversionRate?.toFixed(2) || 0}</div>
              <div className="text-sm mt-1">متوسط معدل التحويل</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.byPoultryType?.length || 0}</div>
              <div className="text-sm mt-1">أنواع الدواجن</div>
            </div>
          </div>
        </div>
      )}

      {/* توقعات المستقبل */}
      {showPredictions && predictions && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-right text-purple-800 mb-4">🔮 توقعات الاستهلاك المستقبلية</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك اليومي المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{Math.round(predictions.recommendations?.daily || 0)} كجم</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك الأسبوعي المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{Math.round(predictions.recommendations?.weekly || 0)} كجم</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك الشهري المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{Math.round(predictions.recommendations?.monthly || 0)} كجم</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك الربعي المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{Math.round(predictions.recommendations?.quarterly || 0)} كجم</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">المخزون الاحتياطي الموصى به</div>
              <div className="text-xl font-bold text-orange-600">{Math.round(predictions.recommendations?.safetyStock || 0)} كجم</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            بناءً على تحليل بيانات {predictions.period} لنوع {predictions.poultryType === "all" ? "جميع الدواجن" : predictions.poultryType}
          </div>
        </div>
      )}

      {/* فلترة البحث */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-bold text-right mb-4">بحث وتصفية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            name="poultryType"
            value={filters.poultryType}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          >
            <option value="">كل الأنواع</option>
            {poultryTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <input
            type="text"
            name="batchNumber"
            placeholder="رقم الدفعة"
            value={filters.batchNumber}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          />
          
          <input
            type="date"
            name="startDate"
            placeholder="من تاريخ"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
          />
          
          <input
            type="date"
            name="endDate"
            placeholder="إلى تاريخ"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
          />
          
          <button
            onClick={resetFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            إعادة ضبط
          </button>
        </div>
      </div>

      {/* جدول التقارير */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-right">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">رقم الدفعة</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">نوع الدواجن</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الاستهلاك اليومي</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الاستهلاك الأسبوعي</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الاستهلاك الشهري</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">عدد الطيور</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">العمر</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">نوع العلف</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">معدل التحويل</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الحالة الصحية</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">تفاصيل</th>
               </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    </div>
                  </td>
                </tr>
              ) : consumptions.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
                    لا توجد سجلات استهلاك
                  </td>
                </tr>
              ) : (
                consumptions.map((con) => (
                  <tr key={con._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-mono">{con.batchNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPoultryTypeColor(con.poultryType)}`}>
                        {con.poultryType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(con.recordDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-600">
                      {con.dailyConsumption} كجم
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {con.weeklyConsumption || con.dailyConsumption * 7} كجم
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {con.monthlyConsumption || con.dailyConsumption * 30} كجم
                    </td>
                    <td className="px-4 py-3 text-sm">{con.birdCount}</td>
                    <td className="px-4 py-3 text-sm">{con.averageAge} يوم</td>
                    <td className="px-4 py-3 text-sm">{con.feedType}</td>
                    <td className="px-4 py-3 text-sm">{con.conversionRate || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getHealthStatusColor(con.healthStatus)}`}>
                        {con.healthStatus || "جيد"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          alert(`
                            📋 تفاصيل السجل:
                            
                            رقم الدفعة: ${con.batchNumber}
                            نوع الدواجن: ${con.poultryType}
                            التاريخ: ${new Date(con.recordDate).toLocaleDateString("ar-EG")}
                            
                            📊 الاستهلاك:
                            يومي: ${con.dailyConsumption} كجم
                            أسبوعي: ${con.weeklyConsumption || con.dailyConsumption * 7} كجم
                            شهري: ${con.monthlyConsumption || con.dailyConsumption * 30} كجم
                            
                            🐔 معلومات الطيور:
                            العدد: ${con.birdCount}
                            متوسط العمر: ${con.averageAge} يوم
                            
                            🍽️ معلومات العلف:
                            النوع: ${con.feedType}
                            الماركة: ${con.feedBrand || "غير محدد"}
                            معدل التحويل: ${con.conversionRate || "غير محدد"}
                            التكلفة: ${con.feedCost ? con.feedCost + " كجم" : "غير محدد"}
                            
                            🌡️ الظروف:
                            درجة الحرارة: ${con.temperature || "غير محدد"}°C
                            الحالة الصحية: ${con.healthStatus || "جيد"}
                            
                            📝 ملاحظات: ${con.notes || "لا توجد"}
                            
                            📅 تاريخ التسجيل: ${new Date(con.createdAt).toLocaleString("ar-EG")}
                          `);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                السابق
              </button>
              <span className="px-3 py-1">
                صفحة {pagination.page} من {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
            <div className="text-sm text-gray-600">
              إجمالي {pagination.total} سجل
            </div>
          </div>
        )}
      </div>

      {/* إحصائيات حسب نوع المنتج */}
      {stats && stats.byPoultryType && stats.byPoultryType.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-right mb-4">📈 إحصائيات حسب نوع الدواجن</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byPoultryType.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 hover:shadow-md transition">
                <div className="font-bold text-right text-orange-600 text-lg">{item._id}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-right text-sm">
                  <div>📊 عدد السجلات: {item.count}</div>
                  <div>🍽️ إجمالي الاستهلاك: {Math.round(item.totalDailyConsumption).toLocaleString()} كجم</div>
                  <div>📈 متوسط الاستهلاك: {Math.round(item.avgDailyConsumption).toLocaleString()} كجم/يوم</div>
                  <div>🐔 إجمالي الطيور: {Math.round(item.totalBirdCount).toLocaleString()}</div>
                  <div>🔄 متوسط التحويل: {item.avgConversionRate?.toFixed(2) || "-"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أعلى 5 دفعات استهلاكاً */}
      {stats && stats.topBatches && stats.topBatches.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-right mb-4">🏆 أعلى 5 دفعات استهلاكاً</h3>
          <div className="space-y-2">
            {stats.topBatches.map((batch, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{batch.poultryType}</div>
                <div className="text-sm font-mono">{batch.batchNumber}</div>
                <div className="text-sm font-bold text-orange-600">{batch.dailyConsumption} كجم/يوم</div>
                <div className="text-sm text-gray-500">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodConsumptionReports;