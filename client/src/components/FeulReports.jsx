import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const FuelReports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    facilityName: "",
    ownerName: "",
    contactNumber: "",
    fuelType: "",
    quantity: "",
    deliveryDate: "",
    status: "",
  });

  const API_URL = "http://localhost:5000/api/fuel-orders";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL);

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError("فشل في جلب البيانات");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("حدث خطأ أثناء جلب البيانات");
      setLoading(false);
    }
  };

  // دالة حذف الطلب - مع الاتصال بالخادم
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      try {
        const response = await axios.delete(`${API_URL}/${id}`);
        
        if (response.data.success) {
          // تحديث القائمة المحلية بعد الحذف الناجح
          setOrders(orders.filter((order) => order._id !== id));
          alert("تم حذف الطلب بنجاح");
        } else {
          alert("فشل في حذف الطلب");
        }
      } catch (err) {
        console.error("Error deleting order:", err);
        alert(err.response?.data?.message || "حدث خطأ أثناء حذف الطلب");
      }
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingOrder(null);
    document.body.style.overflow = "";
  };

  // دالة فتح نافذة التعديل
  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditFormData({
      facilityName: order.facilityName,
      ownerName: order.ownerName,
      contactNumber: order.contactNumber,
      fuelType: order.fuelType,
      quantity: order.quantity,
      deliveryDate: order.deliveryDate ? order.deliveryDate.split("T")[0] : "",
      status: order.status || "قيد المعالجة",
    });
    setShowEditModal(true);
    document.body.style.overflow = "hidden";
  };

  // دالة تحديث البيانات في الفورم
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // دالة حفظ التعديلات - مع الاتصال بالخادم
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${API_URL}/${editingOrder._id}`, editFormData);
      
      if (response.data.success) {
        // تحديث القائمة المحلية بعد التعديل الناجح
        setOrders(
          orders.map((order) =>
            order._id === editingOrder._id
              ? { ...order, ...response.data.data }
              : order
          )
        );
        
        setShowEditModal(false);
        setEditingOrder(null);
        alert("تم تحديث الطلب بنجاح");
      } else {
        alert("فشل في تحديث الطلب");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء تحديث الطلب");
    }
  };

  // دالة تصدير PDF محسنة
  const exportToPDF = () => {
    if (orders.length === 0) {
      alert("لا توجد طلبات لتصديرها");
      return;
    }

    const doc = new jsPDF();
    
    // إضافة عنوان رئيسي
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("تقرير طلبات وقود التدفئة", 105, 20, { align: "center" });
    
    // إضافة خط فاصل
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 25, 190, 25);
    
    // إضافة معلومات التقرير
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}`, 105, 35, { align: "center" });
    doc.text(`عدد الطلبات: ${orders.length}`, 105, 42, { align: "center" });
    
    // إحصائيات سريعة
    const totalQuantity = orders.reduce((sum, order) => sum + (order.quantity || 0), 0);
    const completedOrders = orders.filter(order => order.status === "تم التسليم").length;
    const pendingOrders = orders.filter(order => order.status === "قيد المعالجة").length;
    
    doc.setFontSize(9);
    doc.text(`إجمالي الكمية: ${totalQuantity} لتر`, 190, 50, { align: "right" });
    doc.text(`الطلبات المكتملة: ${completedOrders}`, 190, 56, { align: "right" });
    doc.text(`الطلبات قيد المعالجة: ${pendingOrders}`, 190, 62, { align: "right" });
    
    // تجهيز البيانات للجدول
    const tableData = orders.map((order) => [
      order.facilityName,
      order.ownerName,
      order.contactNumber,
      order.fuelType,
      `${order.quantity} لتر`,
      order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("ar-EG") : "غير محدد",
      order.status || "قيد المعالجة",
    ]);
    
    const tableHeaders = [
      "اسم المنشأة",
      "اسم المالك",
      "رقم الاتصال",
      "نوع الوقود",
      "الكمية",
      "تاريخ التسليم",
      "الحالة",
    ];
    
    // إنشاء الجدول مع تحسينات
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 70,
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
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
      },
      margin: { top: 70, right: 15, bottom: 20, left: 15 },
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
    doc.text("تم إنشاء هذا التقرير بواسطة نظام إدارة طلبات الوقود", 105, finalY, { align: "center" });
    
    // حفظ PDF
    doc.save(`تقرير_طلبات_الوقود_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // دالة تصدير PDF لطلب محدد
  const exportSingleOrderToPDF = (order) => {
    const doc = new jsPDF();
    
    // إضافة عنوان
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("طلب وقود التدفئة", 105, 20, { align: "center" });
    
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 25, 190, 25);
    
    // إضافة تفاصيل الطلب
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 40;
    const lineHeight = 10;
    
    doc.text(`اسم المنشأة: ${order.facilityName}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`اسم المالك: ${order.ownerName}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`رقم الاتصال: ${order.contactNumber}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`نوع الوقود: ${order.fuelType}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`الكمية: ${order.quantity} لتر`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    doc.text(`تاريخ التسليم: ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("ar-EG") : "غير محدد"}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    
    // إضافة الحالة مع تنسيق خاص
    doc.text(`الحالة: `, 190, yPosition, { align: "right" });
    const statusColor = order.status === "تم التسليم" ? [40, 167, 69] : 
                       order.status === "قيد المعالجة" ? [255, 193, 7] : [108, 117, 125];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`${order.status || "قيد المعالجة"}`, 190, yPosition, { align: "right" });
    yPosition += lineHeight;
    
    // إضافة تذييل
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`تاريخ الطباعة: ${new Date().toLocaleString("ar-EG")}`, 105, yPosition + 20, { align: "center" });
    
    // حفظ PDF
    doc.save(`طلب_وقود_${order.facilityName}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // دالة الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch(status) {
      case "تم التسليم":
        return "bg-green-100 text-green-800";
      case "قيد المعالجة":
        return "bg-yellow-100 text-yellow-800";
      case "ملغي":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center mt-10">جاري التحميل...</div>;
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
            تصدير جميع الطلبات إلى PDF
          </button>
        </div>
        <h2 className="text-2xl font-bold text-right">
          تقارير طلبات وقود التدفئة
        </h2>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200 text-right">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border">اسم المنشأة</th>
              <th className="py-3 px-4 border">اسم المالك</th>
              <th className="py-3 px-4 border">رقم الاتصال</th>
              <th className="py-3 px-4 border">نوع الوقود</th>
              <th className="py-3 px-4 border">الكمية</th>
              <th className="py-3 px-4 border">تاريخ التسليم</th>
              <th className="py-3 px-4 border">الحالة</th>
              <th className="py-3 px-4 border">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border">{order.facilityName}</td>
                <td className="py-3 px-4 border">{order.ownerName}</td>
                <td className="py-3 px-4 border">{order.contactNumber}</td>
                <td className="py-3 px-4 border">{order.fuelType}</td>
                <td className="py-3 px-4 border">{order.quantity} لتر</td>
                <td className="py-3 px-4 border">
                  {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("ar-EG") : "غير محدد"}
                </td>
                <td className="py-3 px-4 border">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                  >
                    {order.status || "قيد المعالجة"}
                  </span>
                </td>
                <td className="py-3 px-4 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(order)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => exportSingleOrderToPDF(order)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition duration-200 text-sm"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
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

        {orders.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            لا توجد طلبات حالياً
          </div>
        )}
      </div>

      {/* ===== مودال التعديل ===== */}
      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.25)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" dir="rtl">
            {/* رأس المودال */}
            <div className="flex items-center justify-between p-5 border-b">
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-right">تعديل الطلب</h3>
            </div>

            {/* محتوى النموذج — قابل للتمرير */}
            <div className="overflow-y-auto flex-1 p-5">
              <form id="edit-modal-form" onSubmit={handleUpdate} className="space-y-4">
                <div>
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
                <div>
                  <label className="block text-right mb-2">اسم المالك</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={editFormData.ownerName}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">رقم الاتصال</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={editFormData.contactNumber}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded text-right"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-right mb-2">نوع الوقود</label>
                    <select
                      name="fuelType"
                      value={editFormData.fuelType}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded text-right"
                      required
                    >
                      <option value="ديزل">ديزل</option>
                      <option value="غاز طبيعي">غاز طبيعي</option>
                      <option value="كاز">كاز</option>
                      <option value="مازوت">مازوت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-right mb-2">الكمية (لتر)</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded text-right"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-right mb-2">تاريخ التسليم</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={editFormData.deliveryDate}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-right mb-2">حالة الطلب</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="w-full p-2 border rounded text-right"
                  >
                    <option value="قيد المعالجة">قيد المعالجة</option>
                    <option value="تم التسليم">تم التسليم</option>
                    <option value="ملغي">ملغي</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
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
        </div>
      )}
    </div>
  );
};

export default FuelReports;