import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SanitationReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReport, setEditingReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    facilityName: "",
    location: "",
    cleanlinessRating: "",
    notes: "",
  });

  const API_URL = "http://localhost:5000/api/sanitation-reports";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(API_URL);

      if (response.data.success) {
        setReports(response.data.data);
      } else {
        setError("فشل في جلب البيانات");
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب البيانات");
      setLoading(false);
    }
  };

  // دالة حذف التقرير مع الاتصال بالخادم
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التقرير؟")) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`);
        
        if (response.data.success) {
          // تحديث القائمة المحلية بعد الحذف الناجح
          setReports(reports.filter((report) => report._id !== id));
          alert("تم حذف التقرير بنجاح");
        } else {
          alert("فشل في حذف التقرير");
        }
      } catch (err) {
        console.error("Error deleting report:", err);
        alert(err.response?.data?.message || "حدث خطأ أثناء حذف التقرير");
      }
    }
  };

  // دالة فتح نافذة التعديل
  const handleEdit = (report) => {
    setEditingReport(report);
    setEditFormData({
      facilityName: report.facilityName,
      location: report.location,
      cleanlinessRating: report.cleanlinessRating,
      notes: report.notes || "",
    });
    setShowEditModal(true);
  };

  // دالة تحديث البيانات في الفورم
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // دالة حفظ التعديلات مع الاتصال بالخادم
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${API_URL}/${editingReport._id}`, editFormData);
      
      if (response.data.success) {
        // تحديث القائمة المحلية بعد التعديل الناجح
        setReports(
          reports.map((report) =>
            report._id === editingReport._id
              ? { ...report, ...response.data.data }
              : report
          )
        );
        
        setShowEditModal(false);
        setEditingReport(null);
        alert("تم تحديث التقرير بنجاح");
      } else {
        alert("فشل في تحديث التقرير");
      }
    } catch (err) {
      console.error("Error updating report:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("حدث خطأ أثناء تحديث التقرير");
      }
    }
  };

  // دالة تصدير PDF محسنة
  const exportToPDF = () => {
    if (reports.length === 0) {
      alert("لا توجد تقارير لتصديرها");
      return;
    }

    const doc = new jsPDF();
    
    // إضافة عنوان رئيسي
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("تقارير النظافة", 105, 20, { align: "center" });
    
    // إضافة خط فاصل
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 25, 190, 25);
    
    // إضافة معلومات التقرير
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`, 105, 35, { align: "center" });
    doc.text(`عدد التقارير: ${reports.length}`, 105, 42, { align: "center" });
    
    // تجهيز البيانات للجدول
    const tableData = reports.map((report) => [
      report.facilityName,
      report.location,
      `${report.cleanlinessRating}/10`,
      report.notes || "لا توجد ملاحظات",
      new Date(report.createdAt).toLocaleDateString("ar-EG"),
    ]);
    
    // عناوين الجدول
    const tableHeaders = [
      "اسم المنشأة",
      "الموقع",
      "تقييم النظافة",
      "الملاحظات",
      "تاريخ الإنشاء",
    ];
    
    // إنشاء الجدول مع تحسينات - استخدام autoTable بشكل صحيح
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 50,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "right",
        font: "helvetica",
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
        halign: "right",
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 45 },
        4: { cellWidth: 30 },
      },
      margin: { top: 50, right: 15, bottom: 20, left: 15 },
      didDrawPage: (data) => {
        // إضافة رقم الصفحة
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `الصفحة ${data.pageNumber} من ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      },
    });
    
    // إضافة تذييل
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("تم إنشاء هذا التقرير بواسطة نظام إدارة التقارير", 105, finalY, { align: "center" });
    
    // حفظ PDF
    doc.save(`تقارير_النظافة_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // دالة تصدير PDF لتقرير محدد
  const exportSingleReportToPDF = (report) => {
    const doc = new jsPDF();
    
    // إضافة عنوان
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("تقرير النظافة", 105, 20, { align: "center" });
    
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 25, 190, 25);
    
    // إضافة تفاصيل التقرير
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 40;
    const lineHeight = 10;
    
    doc.text(`اسم المنشأة: ${report.facilityName}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`الموقع: ${report.location}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`تقييم النظافة: ${report.cleanlinessRating}/10`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`تاريخ الإنشاء: ${new Date(report.createdAt).toLocaleDateString("ar-EG")}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    
    // إضافة الملاحظات
    if (report.notes) {
      doc.text("الملاحظات:", 190, yPosition, { align: "right" });
      yPosition += lineHeight;
      
      const splitNotes = doc.splitTextToSize(report.notes, 170);
      doc.text(splitNotes, 190, yPosition, { align: "right" });
      yPosition += splitNotes.length * lineHeight;
    }
    
    // إضافة تذييل
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`تاريخ الطباعة: ${new Date().toLocaleString("ar-EG")}`, 105, yPosition + 20, { align: "center" });
    
    // حفظ PDF
    doc.save(`تقرير_${report.facilityName}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // دالة لتحديد لون التقييم
  const getRatingColor = (rating) => {
    if (rating >= 8) return "bg-green-100 text-green-800";
    if (rating >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return <div className="text-center mt-10">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            تصدير جميع التقارير إلى PDF
          </button>
        </div>
        <h2 className="text-2xl font-bold text-right">تقارير النظافة</h2>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200 text-right">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border">اسم المنشأة</th>
              <th className="py-3 px-4 border">الموقع</th>
              <th className="py-3 px-4 border">تقييم النظافة</th>
              <th className="py-3 px-4 border">الملاحظات</th>
              <th className="py-3 px-4 border">تاريخ الإنشاء</th>
              <th className="py-3 px-4 border">الإجراءات</th>
             </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4 border">{report.facilityName}</td>
                <td className="py-3 px-4 border">{report.location}</td>
                <td className="py-3 px-4 border">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(
                      report.cleanlinessRating
                    )}`}
                  >
                    {report.cleanlinessRating} / 10
                  </span>
                </td>
                <td className="py-3 px-4 border">
                  {report.notes || "لا توجد ملاحظات"}
                </td>
                <td className="py-3 px-4 border">
                  {new Date(report.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="py-3 px-4 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(report)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => exportSingleReportToPDF(report)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reports.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            لا توجد تقارير حالياً
          </div>
        )}
      </div>

      {/* نافذة تعديل التقرير - Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-right">تعديل التقرير</h3>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-right mb-2">اسم المنشأة</label>
                <input
                  type="text"
                  name="facilityName"
                  value={editFormData.facilityName}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-right mb-2">الموقع</label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-right mb-2">
                  تقييم النظافة (من 1 إلى 10)
                </label>
                <input
                  type="number"
                  name="cleanlinessRating"
                  value={editFormData.cleanlinessRating}
                  onChange={handleEditInputChange}
                  min="1"
                  max="10"
                  step="1"
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-right mb-2">الملاحظات</label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditInputChange}
                  rows="4"
                  className="w-full p-2 border rounded text-right"
                  placeholder="أدخل الملاحظات هنا..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SanitationReports;