import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PackingReports = () => {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    productType: "",
    operatorName: "",
    shift: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });
  const [showStats, setShowStats] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchOperations();
    fetchStatistics();
  }, [filters, pagination.page]);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      // بناء query string من الفلاتر
      const queryParams = new URLSearchParams();
      if (filters.productType) queryParams.append("productType", filters.productType);
      if (filters.operatorName) queryParams.append("operatorName", filters.operatorName);
      if (filters.shift) queryParams.append("shift", filters.shift);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      queryParams.append("page", pagination.page);
      queryParams.append("limit", 10);

      const response = await axios.get(
        `http://localhost:5000/api/packing-operations?${queryParams}`
      );

      if (response.data.success) {
        setOperations(response.data.data);
        setPagination({
          page: response.data.page,
          total: response.data.total,
          pages: response.data.pages
        });
      }
    } catch (error) {
      console.error("Error fetching operations:", error);
      showMessage("error", "حدث خطأ أثناء جلب التقارير");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/packing-operations/stats/summary"
      );
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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
      productType: "",
      operatorName: "",
      shift: "",
      status: "",
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
    doc.text("تقارير عمليات الفرز والتعبئة", 105, 15, { align: "center" });
    
    // تاريخ التقرير
    doc.setFontSize(10);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`, 105, 25, { align: "center" });
    
    // إعداد بيانات الجدول
    const tableData = operations.map(op => [
      op.operatorName,
      op.shift,
      op.productType,
      op.batchNumber,
      op.totalQuantity,
      `${op.gradeA} / ${op.gradeB} / ${op.gradeC}`,
      op.rejected,
      op.packagesCount,
      new Date(op.sortingDate).toLocaleDateString("ar-EG"),
      op.status
    ]);
    
    const tableHeaders = [
      "اسم المشغل",
      "الوردية",
      "نوع المنتج",
      "رقم الدفعة",
      "الكمية",
      "A/B/C",
      "مرفوض",
      "العبوات",
      "التاريخ",
      "الحالة"
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
    
    doc.save(`تقارير_الفرز_والتعبئة_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportToExcel = () => {
    // تحويل البيانات إلى CSV
    const headers = [
      "اسم المشغل",
      "الوردية",
      "نوع المنتج",
      "رقم الدفعة",
      "التاريخ",
      "الكمية الإجمالية",
      "درجة A",
      "درجة B",
      "درجة C",
      "مرفوض",
      "نوع التعبئة",
      "عدد العبوات",
      "الوزن الإجمالي",
      "موقع التخزين",
      "الحالة",
      "الملاحظات"
    ];
    
    const csvData = operations.map(op => [
      op.operatorName,
      op.shift,
      op.productType,
      op.batchNumber,
      new Date(op.sortingDate).toLocaleDateString("ar-EG"),
      op.totalQuantity,
      op.gradeA,
      op.gradeB,
      op.gradeC,
      op.rejected,
      op.packingType,
      op.packagesCount,
      op.totalWeight || "",
      op.storageLocation || "",
      op.status,
      op.notes || ""
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `تقارير_الفرز_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "مكتملة": return "bg-green-100 text-green-800";
      case "قيد التنفيذ": return "bg-yellow-100 text-yellow-800";
      case "مراجعة": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftColor = (shift) => {
    switch(shift) {
      case "صباحية": return "bg-orange-100 text-orange-800";
      case "مسائية": return "bg-purple-100 text-purple-800";
      case "ليلية": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const productTypes = ["بيض طازج", "بيض مبرد", "لحم دجاج", "لحم بط", "علف", "أخرى"];
  const shifts = ["صباحية", "مسائية", "ليلية"];
  const statuses = ["مكتملة", "قيد التنفيذ", "مراجعة"];

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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
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
          </div>
          <h1 className="text-2xl font-bold text-white text-right">
            📊 تقارير عمليات الفرز والتعبئة
          </h1>
        </div>
      </div>

      {/* الإحصائيات */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalOperations || 0}</div>
              <div className="text-sm mt-1">إجمالي العمليات</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalQuantity || 0}</div>
              <div className="text-sm mt-1">إجمالي الكمية</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.rejectionRate || 0}%</div>
              <div className="text-sm mt-1">نسبة الرفض</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.byShift?.length || 0}</div>
              <div className="text-sm mt-1">الورديات النشطة</div>
            </div>
          </div>
        </div>
      )}

      {/* فلترة البحث */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-bold text-right mb-4">بحث وتصفية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            name="productType"
            value={filters.productType}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          >
            <option value="">كل المنتجات</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <input
            type="text"
            name="operatorName"
            placeholder="اسم المشغل"
            value={filters.operatorName}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          />
          
          <select
            name="shift"
            value={filters.shift}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          >
            <option value="">كل الورديات</option>
            {shifts.map(shift => (
              <option key={shift} value={shift}>{shift}</option>
            ))}
          </select>
          
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg text-right"
          >
            <option value="">كل الحالات</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
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
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">المشغل</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الوردية</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الدفعة</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">A/B/C</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">مرفوض</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">العبوات</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : operations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                    لا توجد عمليات مسجلة
                  </td>
                </tr>
              ) : (
                operations.map((op) => (
                  <tr key={op._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{op.operatorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getShiftColor(op.shift)}`}>
                        {op.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{op.productType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{op.batchNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(op.sortingDate).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{op.totalQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {op.gradeA}/{op.gradeB}/{op.gradeC}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{op.rejected}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{op.packagesCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(op.status)}`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // عرض تفاصيل العملية
                          alert(`
                            نوع التعبئة: ${op.packingType}
                            الوزن الإجمالي: ${op.totalWeight || "غير محدد"} كجم
                            موقع التخزين: ${op.storageLocation || "غير محدد"}
                            درجة الحرارة: ${op.temperature || "غير محدد"}°C
                            الرطوبة: ${op.humidity || "غير محدد"}%
                            المعدات: ${op.equipmentUsed || "غير محدد"}
                            الملاحظات: ${op.notes || "لا توجد"}
                          `);
                        }}
                        className="text-blue-600 hover:text-blue-800"
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
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
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
              إجمالي {pagination.total} عملية
            </div>
          </div>
        )}
      </div>

      {/* إحصائيات إضافية - حسب نوع المنتج */}
      {stats && stats.byProductType && stats.byProductType.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold text-right mb-4">إحصائيات حسب نوع المنتج</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byProductType.map((item, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="font-bold text-right text-blue-600">{item._id}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-right text-sm">
                  <div>عدد العمليات: {item.count}</div>
                  <div>الكمية الإجمالية: {item.totalQuantity}</div>
                  <div>متوسط درجة A: {Math.round(item.avgGradeA)}</div>
                  <div>متوسط المرفوض: {Math.round(item.avgRejected)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingReports;