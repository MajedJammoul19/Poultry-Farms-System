import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PreventionReports = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPlan, setEditingPlan] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    facilityName: "",
    location: "",
    date: "",
    preventionPlan: "",
    recommendations: "",
  });

  const API_URL = "http://localhost:5000/api/prevention-plans";

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(API_URL);

      if (response.data.success) {
        setPlans(response.data.data);
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
          setPlans(plans.filter((plan) => plan._id !== id));
          alert("تم حذف التقرير بنجاح");
        } else {
          alert("فشل في حذف التقرير");
        }
      } catch (err) {
        console.error("Error deleting plan:", err);
        alert(err.response?.data?.error || "حدث خطأ أثناء حذف التقرير");
      }
    }
  };

  // دالة فتح نافذة التعديل
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setEditFormData({
      facilityName: plan.facilityName,
      location: plan.location,
      date: plan.date ? plan.date.split("T")[0] : "",
      preventionPlan: plan.preventionPlan,
      recommendations: plan.recommendations || "",
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
      const response = await axios.put(`${API_URL}/${editingPlan._id}`, editFormData);
      
      if (response.data.success) {
        // تحديث القائمة المحلية بعد التعديل الناجح
        setPlans(
          plans.map((plan) =>
            plan._id === editingPlan._id
              ? { ...plan, ...response.data.data }
              : plan
          )
        );
        
        setShowEditModal(false);
        setEditingPlan(null);
        alert("تم تحديث التقرير بنجاح");
      } else {
        alert("فشل في تحديث التقرير");
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      if (err.response?.data?.error) {
        // عرض رسالة الخطأ من الخادم
        if (Array.isArray(err.response.data.error)) {
          alert(err.response.data.error.join("\n"));
        } else {
          alert(err.response.data.error);
        }
      } else {
        alert("حدث خطأ أثناء تحديث التقرير");
      }
    }
  };

  // دالة تصدير PDF لجميع التقارير
  const exportToPDF = () => {
    if (plans.length === 0) {
      alert("لا توجد تقارير لتصديرها");
      return;
    }

    const doc = new jsPDF();
    
    // إضافة عنوان رئيسي
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("تقارير خطط الوقاية", 105, 20, { align: "center" });
    
    // إضافة خط فاصل
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 25, 190, 25);
    
    // إضافة معلومات التقرير
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`, 105, 35, { align: "center" });
    doc.text(`عدد الخطط: ${plans.length}`, 105, 42, { align: "center" });
    
    // إحصائيات سريعة عن أنواع الخطط
    const planTypes = {};
    plans.forEach(plan => {
      planTypes[plan.preventionPlan] = (planTypes[plan.preventionPlan] || 0) + 1;
    });
    
    doc.setFontSize(9);
    let yStat = 50;
    doc.text("توزيع خطط الوقاية:", 190, yStat, { align: "right" });
    yStat += 6;
    
    Object.entries(planTypes).forEach(([type, count]) => {
      doc.text(`• ${type}: ${count} خطة`, 190, yStat, { align: "right" });
      yStat += 5;
    });
    
    // تجهيز البيانات للجدول
    const tableData = plans.map((plan) => [
      plan.facilityName,
      plan.location,
      new Date(plan.date).toLocaleDateString("ar-EG"),
      plan.preventionPlan,
      plan.recommendations || "لا توجد توصيات",
    ]);
    
    const tableHeaders = [
      "اسم المنشأة",
      "الموقع",
      "التاريخ",
      "خطة الوقاية",
      "التوصيات",
    ];
    
    // إنشاء الجدول
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yStat + 10,
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
        3: { cellWidth: 35 },
        4: { cellWidth: 45 },
      },
      margin: { top: yStat + 10, right: 15, bottom: 20, left: 15 },
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
    doc.text("تم إنشاء هذا التقرير بواسطة نظام إدارة خطط الوقاية", 105, finalY, { align: "center" });
    
    // حفظ PDF
    doc.save(`تقارير_خطط_الوقاية_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // دالة تصدير PDF لتقرير واحد
  const exportSingleReportToPDF = (plan) => {
    const doc = new jsPDF();
    
    // إضافة عنوان
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("تقرير خطة وقاية", 105, 20, { align: "center" });
    
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 25, 190, 25);
    
    // إضافة تفاصيل الخطة
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 40;
    const lineHeight = 10;
    
    doc.text(`اسم المنشأة: ${plan.facilityName}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`الموقع: ${plan.location}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`التاريخ: ${new Date(plan.date).toLocaleDateString("ar-EG")}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    
    // إضافة خطة الوقاية مع تنسيق خاص
    doc.text(`خطة الوقاية: `, 190, yPosition, { align: "right" });
    
    // تلوين خطة الوقاية حسب النوع
    let planColor = [0, 0, 0];
    if (plan.preventionPlan.includes("تطعيم") || plan.preventionPlan.includes("لقاح")) {
      planColor = [41, 128, 185];
    } else if (plan.preventionPlan.includes("تعقيم") || plan.preventionPlan.includes("تطهير")) {
      planColor = [39, 174, 96];
    } else if (plan.preventionPlan.includes("فحص") || plan.preventionPlan.includes("تحليل")) {
      planColor = [155, 89, 182];
    }
    
    doc.setTextColor(planColor[0], planColor[1], planColor[2]);
    doc.text(plan.preventionPlan, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    
    // إعادة تعيين اللون للأسود
    doc.setTextColor(0, 0, 0);
    
    // إضافة التوصيات
    if (plan.recommendations) {
      doc.text("التوصيات:", 190, yPosition, { align: "right" });
      yPosition += lineHeight;
      
      const splitRecommendations = doc.splitTextToSize(plan.recommendations, 170);
      doc.text(splitRecommendations, 190, yPosition, { align: "right" });
      yPosition += splitRecommendations.length * lineHeight;
    } else {
      doc.text("التوصيات: لا توجد توصيات", 190, yPosition, { align: "right" });
      yPosition += lineHeight;
    }
    
    // إضافة خانة التوقيع
    yPosition += 20;
    doc.setDrawColor(100, 100, 100);
    doc.line(20, yPosition, 190, yPosition);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("توقيع المسؤول", 105, yPosition + 5, { align: "center" });
    
    // إضافة تذييل
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`تاريخ الطباعة: ${new Date().toLocaleString("ar-EG")}`, 105, yPosition + 15, { align: "center" });
    
    // حفظ PDF
    doc.save(`خطة_وقاية_${plan.facilityName}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // دالة لتحديد لون الخطة (لتحسين المظهر)
  const getPlanTypeColor = (plan) => {
    if (plan.includes("تطعيم") || plan.includes("لقاح")) {
      return "bg-blue-100 text-blue-800";
    } else if (plan.includes("تعقيم") || plan.includes("تطهير")) {
      return "bg-green-100 text-green-800";
    } else if (plan.includes("فحص") || plan.includes("تحليل")) {
      return "bg-purple-100 text-purple-800";
    } else if (plan.includes("عزل")) {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-gray-100 text-gray-800";
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
        <h2 className="text-2xl font-bold text-right">
          تقارير خطط الوقاية
        </h2>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200 text-right">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border">اسم المنشأة</th>
              <th className="py-3 px-4 border">الموقع</th>
              <th className="py-3 px-4 border">التاريخ</th>
              <th className="py-3 px-4 border">خطة الوقاية</th>
              <th className="py-3 px-4 border">التوصيات</th>
              <th className="py-3 px-4 border">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan._id} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4 border">{plan.facilityName}</td>
                <td className="py-3 px-4 border">{plan.location}</td>
                <td className="py-3 px-4 border">
                  {new Date(plan.date).toLocaleDateString("ar-EG")}
                </td>
                <td className="py-3 px-4 border">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanTypeColor(plan.preventionPlan)}`}>
                    {plan.preventionPlan}
                  </span>
                </td>
                <td className="py-3 px-4 border">
                  {plan.recommendations || "لا توجد توصيات"}
                </td>
                <td className="py-3 px-4 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => exportSingleReportToPDF(plan)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
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

        {plans.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            لا توجد تقارير حالياً
          </div>
        )}
      </div>

      {/* نافذة تعديل التقرير - Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-right">تعديل تقرير الوقاية</h3>
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
                <label className="block text-right mb-2">التاريخ</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-right mb-2">خطة الوقاية</label>
                <select
                  name="preventionPlan"
                  value={editFormData.preventionPlan}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                >
                  <option value="تطعيم شامل">تطعيم شامل</option>
                  <option value="تعقيم دوري">تعقيم دوري</option>
                  <option value="فحص بيطري">فحص بيطري</option>
                  <option value="برنامج وقائي">برنامج وقائي</option>
                  <option value="عزل صحي">عزل صحي</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-right mb-2">التوصيات</label>
                <textarea
                  name="recommendations"
                  value={editFormData.recommendations}
                  onChange={handleEditInputChange}
                  rows="3"
                  className="w-full p-2 border rounded text-right"
                  placeholder="أدخل التوصيات هنا..."
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

export default PreventionReports;