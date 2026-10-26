import React, { useState } from "react";
import axios from "axios";

const PackingOperationForm = () => {
  const [formData, setFormData] = useState({
    operatorName: "",
    shift: "صباحية",
    productType: "بيض طازج",
    batchNumber: "",
    sortingDate: new Date().toISOString().split('T')[0],
    totalQuantity: "",
    gradeA: "",
    gradeB: "",
    gradeC: "",
    rejected: "",
    sortingCriteria: "جودة شاملة",
    packingType: "كرتون",
    packagesCount: "",
    weightPerPackage: "",
    totalWeight: "",
    storageLocation: "",
    temperature: "",
    humidity: "",
    equipmentUsed: "",
    notes: "",
    status: "مكتملة"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // حساب الوزن الإجمالي تلقائياً
    if (name === "weightPerPackage" || name === "packagesCount") {
      if (formData.weightPerPackage && formData.packagesCount) {
        const totalWeight = parseFloat(formData.weightPerPackage) * parseInt(formData.packagesCount);
        setFormData(prev => ({
          ...prev,
          totalWeight: totalWeight || ""
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من تطابق الكميات
    const total = parseInt(formData.gradeA || 0) + 
                  parseInt(formData.gradeB || 0) + 
                  parseInt(formData.gradeC || 0) + 
                  parseInt(formData.rejected || 0);
    
    if (total !== parseInt(formData.totalQuantity || 0)) {
      setMessage({
        type: "error",
        text: "مجموع الدرجات لا يساوي الكمية الإجمالية. يرجى التحقق من القيم."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        "http://localhost:5000/api/packing-operations",
        formData
      );
      
      if (response.data.success) {
        setMessage({
          type: "success",
          text: "تم تسجيل عملية الفرز والتعبئة بنجاح!"
        });
        
        // إعادة تعيين النموذج
        setFormData({
          operatorName: "",
          shift: "صباحية",
          productType: "بيض طازج",
          batchNumber: "",
          sortingDate: new Date().toISOString().split('T')[0],
          totalQuantity: "",
          gradeA: "",
          gradeB: "",
          gradeC: "",
          rejected: "",
          sortingCriteria: "جودة شاملة",
          packingType: "كرتون",
          packagesCount: "",
          weightPerPackage: "",
          totalWeight: "",
          storageLocation: "",
          temperature: "",
          humidity: "",
          equipmentUsed: "",
          notes: "",
          status: "مكتملة"
        });
        
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "حدث خطأ أثناء تسجيل العملية"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
      setFormData({
        operatorName: "",
        shift: "صباحية",
        productType: "بيض طازج",
        batchNumber: "",
        sortingDate: new Date().toISOString().split('T')[0],
        totalQuantity: "",
        gradeA: "",
        gradeB: "",
        gradeC: "",
        rejected: "",
        sortingCriteria: "جودة شاملة",
        packingType: "كرتون",
        packagesCount: "",
        weightPerPackage: "",
        totalWeight: "",
        storageLocation: "",
        temperature: "",
        humidity: "",
        equipmentUsed: "",
        notes: "",
        status: "مكتملة"
      });
    }
  };

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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white text-right">
          📦 عمليات الفرز والتعبئة
        </h1>
        <p className="text-purple-100 text-right mt-2">
          سجل بيانات عمليات الفرز والتعبئة للمنتجات
        </p>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        {/* معلومات المشغل */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات المشغل</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-right mb-2">اسم المشغل *</label>
              <input
                type="text"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">الوردية *</label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="صباحية">صباحية</option>
                <option value="مسائية">مسائية</option>
                <option value="ليلية">ليلية</option>
              </select>
            </div>
            <div>
              <label className="block text-right mb-2">تاريخ الفرز *</label>
              <input
                type="date"
                name="sortingDate"
                value={formData.sortingDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* معلومات المنتج */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات المنتج</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right mb-2">نوع المنتج *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="بيض طازج">بيض طازج</option>
                <option value="بيض مبرد">بيض مبرد</option>
                <option value="لحم دجاج">لحم دجاج</option>
                <option value="لحم بط">لحم بط</option>
                <option value="علف">علف</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-right mb-2">رقم الدفعة *</label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">الكمية الإجمالية *</label>
              <input
                type="number"
                name="totalQuantity"
                value={formData.totalQuantity}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">معايير الفرز</label>
              <select
                name="sortingCriteria"
                value={formData.sortingCriteria}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right focus:ring-2 focus:ring-purple-500"
              >
                <option value="حجم">حجم</option>
                <option value="وزن">وزن</option>
                <option value="لون">لون</option>
                <option value="جودة شاملة">جودة شاملة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>
        </div>

        {/* نتائج الفرز */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">نتائج الفرز حسب الجودة</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <label className="block text-right mb-2 text-green-700 font-bold">درجة ممتازة (A)</label>
              <input
                type="number"
                name="gradeA"
                value={formData.gradeA}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <label className="block text-right mb-2 text-blue-700 font-bold">درجة جيدة (B)</label>
              <input
                type="number"
                name="gradeB"
                value={formData.gradeB}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <label className="block text-right mb-2 text-yellow-700 font-bold">درجة مقبولة (C)</label>
              <input
                type="number"
                name="gradeC"
                value={formData.gradeC}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <label className="block text-right mb-2 text-red-700 font-bold">مرفوض</label>
              <input
                type="number"
                name="rejected"
                value={formData.rejected}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
          </div>
        </div>

        {/* معلومات التعبئة */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات التعبئة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-right mb-2">نوع التعبئة *</label>
              <select
                name="packingType"
                value={formData.packingType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              >
                <option value="كرتون">كرتون</option>
                <option value="بلاستيك">بلاستيك</option>
                <option value="خشب">خشب</option>
                <option value="أكياس">أكياس</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-right mb-2">عدد العبوات *</label>
              <input
                type="number"
                name="packagesCount"
                value={formData.packagesCount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">الوزن لكل عبوة (كجم)</label>
              <input
                type="number"
                name="weightPerPackage"
                value={formData.weightPerPackage}
                onChange={handleInputChange}
                step="0.1"
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-right mb-2">الوزن الإجمالي (كجم)</label>
              <input
                type="number"
                name="totalWeight"
                value={formData.totalWeight}
                onChange={handleInputChange}
                step="0.1"
                className="w-full p-2 border rounded-lg text-right bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-right mb-2">موقع التخزين</label>
              <input
                type="text"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
          </div>
        </div>

        {/* الظروف البيئية */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">الظروف البيئية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right mb-2">درجة الحرارة (مئوية)</label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                step="0.1"
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-right mb-2">نسبة الرطوبة (%)</label>
              <input
                type="number"
                name="humidity"
                value={formData.humidity}
                onChange={handleInputChange}
                step="0.1"
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات إضافية</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-right mb-2">المعدات المستخدمة</label>
              <input
                type="text"
                name="equipmentUsed"
                value={formData.equipmentUsed}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                placeholder="مثال: ماكينة فرز أوتوماتيكية، ميزان إلكتروني"
              />
            </div>
            <div>
              <label className="block text-right mb-2">ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border rounded-lg text-right"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
            <div>
              <label className="block text-right mb-2">الحالة</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
              >
                <option value="مكتملة">مكتملة</option>
                <option value="قيد التنفيذ">قيد التنفيذ</option>
                <option value="مراجعة">مراجعة</option>
              </select>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 justify-end border-t pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
          >
            مسح البيانات
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "جاري التسجيل..." : "تسجيل العملية"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackingOperationForm;