import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FuelConsumptionReports = () => {
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [filters, setFilters] = useState({
    vehicleType: "",
    vehicleNumber: "",
    driverName: "",
    fuelType: "",
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
      if (filters.vehicleType) queryParams.append("vehicleType", filters.vehicleType);
      if (filters.vehicleNumber) queryParams.append("vehicleNumber", filters.vehicleNumber);
      if (filters.driverName) queryParams.append("driverName", filters.driverName);
      if (filters.fuelType) queryParams.append("fuelType", filters.fuelType);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      queryParams.append("page", pagination.page);
      queryParams.append("limit", 10);

      const response = await axios.get(
        `http://localhost:5000/api/fuel-consumption?${queryParams}`
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
        "http://localhost:5000/api/fuel-consumption/stats/summary"
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
          `http://localhost:5000/api/fuel-consumption/predict/future?days=30&vehicleType=${filters.vehicleType || "all"}`
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
      vehicleType: "",
      vehicleNumber: "",
      driverName: "",
      fuelType: "",
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
    doc.text("تقارير استهلاك الوقود", 105, 15, { align: "center" });
    
    // تاريخ التقرير
    doc.setFontSize(10);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`, 105, 25, { align: "center" });
    
    // إعداد بيانات الجدول
    const tableData = consumptions.map(con => [
      con.vehicleNumber,
      con.vehicleType,
      con.driverName,
      con.fuelType,
      con.fuelAmount,
      con.totalCost ? con.totalCost.toFixed(2) : (con.fuelAmount * con.fuelCost).toFixed(2),
      con.distanceTraveled || "-",
      con.consumptionRate ? con.consumptionRate.toFixed(1) : "-",
      con.efficiency ? con.efficiency.toFixed(1) : "-",
      new Date(con.recordDate).toLocaleDateString("ar-EG")
    ]);
    
    const tableHeaders = [
      "رقم المركبة",
      "نوع المركبة",
      "السائق",
      "نوع الوقود",
      "الكمية (لتر)",
      "التكلفة (ريال)",
      "المسافة (كم)",
      "الاستهلاك (لتر/100كم)",
      "الكفاءة (كم/لتر)",
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
    
    doc.save(`تقارير_استهلاك_الوقود_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    const headers = [
      "رقم المركبة",
      "نوع المركبة",
      "اسم السائق",
      "نوع الوقود",
      "التاريخ",
      "الكمية (لتر)",
      "سعر اللتر (ريال)",
      "التكلفة الإجمالية (ريال)",
      "بداية العداد (كم)",
      "نهاية العداد (كم)",
      "المسافة (كم)",
      "معدل الاستهلاك (لتر/100كم)",
      "الكفاءة (كم/لتر)",
      "ساعات التشغيل",
      "الغرض",
      "وزن الحمولة (كجم)",
      "حالة الطريق",
      "حالة الطقس",
      "محطة التزويد",
      "رقم الفاتورة",
      "ملاحظات"
    ];
    
    const csvData = consumptions.map(con => [
      con.vehicleNumber,
      con.vehicleType,
      con.driverName,
      con.fuelType,
      new Date(con.recordDate).toLocaleDateString("ar-EG"),
      con.fuelAmount,
      con.fuelCost,
      con.totalCost || (con.fuelAmount * con.fuelCost).toFixed(2),
      con.startOdometer || "",
      con.endOdometer || "",
      con.distanceTraveled || "",
      con.consumptionRate ? con.consumptionRate.toFixed(2) : "",
      con.efficiency ? con.efficiency.toFixed(2) : "",
      con.operatingHours || "",
      con.purpose || "",
      con.loadWeight || "",
      con.roadCondition || "",
      con.weatherCondition || "",
      con.refuelingStation || "",
      con.invoiceNumber || "",
      con.notes || ""
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `استهلاك_الوقود_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getVehicleTypeColor = (type) => {
    switch(type) {
      case "شاحنة": return "bg-blue-100 text-blue-800";
      case "حافلة": return "bg-green-100 text-green-800";
      case "سيارة": return "bg-purple-100 text-purple-800";
      case "جرار": return "bg-orange-100 text-orange-800";
      case "مولد كهربائي": return "bg-red-100 text-red-800";
      case "آلة زراعية": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFuelTypeColor = (type) => {
    switch(type) {
      case "ديزل": return "bg-red-100 text-red-800";
      case "بنزين 95": return "bg-green-100 text-green-800";
      case "بنزين 98": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (!efficiency) return "bg-gray-100 text-gray-800";
    if (efficiency >= 15) return "bg-green-100 text-green-800";
    if (efficiency >= 10) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const vehicleTypes = ["شاحنة", "حافلة", "سيارة", "جرار", "مولد كهربائي", "آلة زراعية", "أخرى"];
  const fuelTypes = ["بنزين 95", "بنزين 98", "ديزل", "كاز", "غاز"];

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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 mb-6">
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
            ⛽ تقارير استهلاك الوقود
          </h1>
        </div>
      </div>

      {/* الإحصائيات */}
      {showStats && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalRecords || 0}</div>
                <div className="text-sm mt-1">إجمالي السجلات</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round(stats.totalFuel || 0).toLocaleString()}</div>
                <div className="text-sm mt-1">إجمالي الاستهلاك (لتر)</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round(stats.totalCost || 0).toLocaleString()}</div>
                <div className="text-sm mt-1">إجمالي التكلفة (ريال)</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.averageCostPerLiter?.toFixed(2) || 0}</div>
                <div className="text-sm mt-1">متوسط سعر اللتر (ريال)</div>
              </div>
            </div>
          </div>

          {/* أفضل وأسوأ كفاءة */}
          {stats.bestEfficiency && stats.worstEfficiency && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-right text-green-800 mb-2">🏆 أفضل كفاءة استهلاك</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">المركبة: {stats.bestEfficiency.vehicleNumber}</span>
                  <span className="text-sm text-green-600">الكفاءة: {stats.bestEfficiency.efficiency?.toFixed(2)} كم/لتر</span>
                  <span className="text-sm text-green-600">الاستهلاك: {stats.bestEfficiency.consumptionRate?.toFixed(2)} لتر/100كم</span>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="font-bold text-right text-red-800 mb-2">⚠️ أسوأ كفاءة استهلاك</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">المركبة: {stats.worstEfficiency.vehicleNumber}</span>
                  <span className="text-sm text-red-600">الكفاءة: {stats.worstEfficiency.efficiency?.toFixed(2)} كم/لتر</span>
                  <span className="text-sm text-red-600">الاستهلاك: {stats.worstEfficiency.consumptionRate?.toFixed(2)} لتر/100كم</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* توقعات المستقبل */}
      {showPredictions && predictions && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-right text-purple-800 mb-4">🔮 توقعات استهلاك الوقود المستقبلية</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك اليومي المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{predictions.predictions?.daily || 0} لتر</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك الأسبوعي المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{predictions.predictions?.weekly || 0} لتر</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك الشهري المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{predictions.predictions?.monthly || 0} لتر</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">الاستهلاك الربعي المتوقع</div>
              <div className="text-xl font-bold text-purple-700">{predictions.predictions?.quarterly || 0} لتر</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">التكلفة الشهرية المتوقعة</div>
              <div className="text-xl font-bold text-orange-600">{predictions.predictions?.estimatedCost?.toLocaleString() || 0} ريال</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            بناءً على تحليل بيانات الـ 30 يوم الماضية لنوع {predictions.vehicleType === "all" ? "جميع المركبات" : predictions.vehicleType}
          </div>
        </div>
      )}

      {/* فلترة البحث */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-bold text-right mb-4">بحث وتصفية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <select
            name="vehicleType"
            value={filters.vehicleType}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          >
            <option value="">كل المركبات</option>
            {vehicleTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <input
            type="text"
            name="vehicleNumber"
            placeholder="رقم المركبة"
            value={filters.vehicleNumber}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right uppercase"
          />
          
          <input
            type="text"
            name="driverName"
            placeholder="اسم السائق"
            value={filters.driverName}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          />
          
          <select
            name="fuelType"
            value={filters.fuelType}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          >
            <option value="">كل أنواع الوقود</option>
            {fuelTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
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
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={resetFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            إعادة ضبط الفلترة
          </button>
        </div>
      </div>

      {/* جدول التقارير */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-right">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">رقم المركبة</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">نوع المركبة</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">السائق</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الكمية (لتر)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">التكلفة (ريال)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">المسافة (كم)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الاستهلاك</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">الكفاءة</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                   </td>
                 </tr>
              ) : consumptions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    لا توجد سجلات استهلاك وقود
                   </td>
                 </tr>
              ) : (
                consumptions.map((con) => (
                  <tr key={con._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-mono font-bold">{con.vehicleNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getVehicleTypeColor(con.vehicleType)}`}>
                        {con.vehicleType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{con.driverName}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(con.recordDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{con.fuelAmount} لتر</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {con.totalCost ? con.totalCost.toFixed(2) : (con.fuelAmount * con.fuelCost).toFixed(2)} ريال
                    </td>
                    <td className="px-4 py-3 text-sm">{con.distanceTraveled || "-"} كم</td>
                    <td className="px-4 py-3 text-sm">
                      {con.consumptionRate ? `${con.consumptionRate.toFixed(1)} لتر/100كم` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {con.efficiency ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${getEfficiencyColor(con.efficiency)}`}>
                          {con.efficiency.toFixed(1)} كم/لتر
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          const totalCost = con.totalCost || (con.fuelAmount * con.fuelCost);
                          alert(`
                            📋 تفاصيل استهلاك الوقود:
                            
                            🚛 معلومات المركبة:
                            رقم المركبة: ${con.vehicleNumber}
                            نوع المركبة: ${con.vehicleType}
                            السائق: ${con.driverName}
                            
                            ⛽ معلومات الوقود:
                            التاريخ: ${new Date(con.recordDate).toLocaleDateString("ar-EG")}
                            نوع الوقود: ${con.fuelType}
                            الكمية: ${con.fuelAmount} لتر
                            سعر اللتر: ${con.fuelCost} ريال
                            التكلفة الإجمالية: ${totalCost.toFixed(2)} ريال
                            
                            📊 قراءات العداد:
                            بداية العداد: ${con.startOdometer || "غير محدد"} كم
                            نهاية العداد: ${con.endOdometer || "غير محدد"} كم
                            المسافة المقطوعة: ${con.distanceTraveled || "غير محدد"} كم
                            معدل الاستهلاك: ${con.consumptionRate ? con.consumptionRate.toFixed(2) : "غير محدد"} لتر/100كم
                            الكفاءة: ${con.efficiency ? con.efficiency.toFixed(2) : "غير محدد"} كم/لتر
                            
                            🔧 معلومات إضافية:
                            الغرض: ${con.purpose || "غير محدد"}
                            وزن الحمولة: ${con.loadWeight || "غير محدد"} كجم
                            حالة الطريق: ${con.roadCondition || "غير محدد"}
                            حالة الطقس: ${con.weatherCondition || "غير محدد"}
                            محطة التزويد: ${con.refuelingStation || "غير محدد"}
                            رقم الفاتورة: ${con.invoiceNumber || "غير محدد"}
                            
                            📝 ملاحظات:
                            ملاحظات الصيانة: ${con.maintenanceNotes || "لا توجد"}
                            ملاحظات عامة: ${con.notes || "لا توجد"}
                            
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

      {/* إحصائيات حسب نوع المركبة */}
      {stats && stats.byVehicleType && stats.byVehicleType.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-right mb-4">📊 إحصائيات حسب نوع المركبة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byVehicleType.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 hover:shadow-md transition">
                <div className="font-bold text-right text-blue-600 text-lg">{item._id}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-right text-sm">
                  <div>📊 عدد السجلات: {item.count}</div>
                  <div>⛽ إجمالي الاستهلاك: {Math.round(item.totalFuel).toLocaleString()} لتر</div>
                  <div>💰 إجمالي التكلفة: {Math.round(item.totalCost).toLocaleString()} ريال</div>
                  <div>📈 متوسط الاستهلاك: {item.avgConsumptionRate?.toFixed(2) || "-"} لتر/100كم</div>
                  <div>🏆 متوسط الكفاءة: {item.avgEfficiency?.toFixed(2) || "-"} كم/لتر</div>
                  <div>🛣️ إجمالي المسافة: {Math.round(item.totalDistance).toLocaleString()} كم</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نصائح لتوفير الوقود */}
      <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-bold text-right text-yellow-800 mb-2">💡 نصائح لتقليل استهلاك الوقود وتحسين الكفاءة</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right text-sm text-yellow-700">
          <div>• حافظ على ضغط الإطارات المناسب (يقلل الاستهلاك 3-5%)</div>
          <div>• قم بالصيانة الدورية وتغيير الزيت في الموعد المحدد</div>
          <div>• تجنب التحميل الزائد للمركبات</div>
          <div>• خطط للطرق المثلى لتقليل المسافات</div>
          <div>• استخدم مثبت السرعة على الطرق السريعة</div>
          <div>• تجنب التوقف والتشغيل المتكرر</div>
          <div>• راقب أسلوب القيادة (تسارع وتوقف مفاجئ)</div>
          <div>• استخدم الوقود الموصى به من قبل الشركة المصنعة</div>
        </div>
      </div>
    </div>
  );
};

export default FuelConsumptionReports;