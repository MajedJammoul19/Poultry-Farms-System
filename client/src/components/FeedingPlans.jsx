import React, { useState, useEffect } from "react";
import axios from "axios";

const FeedingPlans = () => {
  const [feedingPlans, setFeedingPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    planName: "",
    poultryType: "دجاج لاحم",
    ageRange: "",
    feedType: "بادئ",
    dailyAmount: "",
    feedingFrequency: 3,
    proteinPercentage: "",
    energyContent: "",
    ingredients: "",
    supplements: "",
    vitamins: "",
    startDay: "",
    endDay: "",
    specialInstructions: "",
    waterRequirements: "",
    expectedWeight: "",
    conversionRate: "",
    isActive: true,
    createdBy: "مدير النظام"
  });

  useEffect(() => {
    fetchFeedingPlans();
  }, [filterType]);

  const fetchFeedingPlans = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:5000/api/feeding-plans";
      if (filterType) {
        url = `http://localhost:5000/api/feeding-plans/poultry/${filterType}`;
      }
      const response = await axios.get(url);
      if (response.data.success) {
        setFeedingPlans(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching feeding plans:", error);
      showMessage("error", "حدث خطأ أثناء جلب خطط التغذية");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchFeedingPlans();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/feeding-plans/search/${searchTerm}`
      );
      if (response.data.success) {
        setFeedingPlans(response.data.data);
      }
    } catch (error) {
      console.error("Error searching:", error);
      showMessage("error", "حدث خطأ أثناء البحث");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (editingId) {
        response = await axios.put(
          `http://localhost:5000/api/feeding-plans/${editingId}`,
          formData
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/feeding-plans",
          formData
        );
      }

      if (response.data.success) {
        showMessage("success", editingId ? "تم تحديث الخطة بنجاح" : "تم إضافة الخطة بنجاح");
        resetForm();
        fetchFeedingPlans();
      }
    } catch (error) {
      console.error("Error saving feeding plan:", error);
      showMessage("error", error.response?.data?.message || "حدث خطأ أثناء حفظ الخطة");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setFormData({
      planName: plan.planName,
      poultryType: plan.poultryType,
      ageRange: plan.ageRange,
      feedType: plan.feedType,
      dailyAmount: plan.dailyAmount,
      feedingFrequency: plan.feedingFrequency,
      proteinPercentage: plan.proteinPercentage,
      energyContent: plan.energyContent,
      ingredients: plan.ingredients,
      supplements: plan.supplements || "",
      vitamins: plan.vitamins || "",
      startDay: plan.startDay,
      endDay: plan.endDay,
      specialInstructions: plan.specialInstructions || "",
      waterRequirements: plan.waterRequirements || "",
      expectedWeight: plan.expectedWeight || "",
      conversionRate: plan.conversionRate || "",
      isActive: plan.isActive,
      createdBy: plan.createdBy
    });
    setEditingId(plan._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخطة؟")) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/feeding-plans/${id}`
      );
      if (response.data.success) {
        showMessage("success", "تم حذف الخطة بنجاح");
        fetchFeedingPlans();
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      showMessage("error", "حدث خطأ أثناء حذف الخطة");
    }
  };

  const resetForm = () => {
    setFormData({
      planName: "",
      poultryType: "دجاج لاحم",
      ageRange: "",
      feedType: "بادئ",
      dailyAmount: "",
      feedingFrequency: 3,
      proteinPercentage: "",
      energyContent: "",
      ingredients: "",
      supplements: "",
      vitamins: "",
      startDay: "",
      endDay: "",
      specialInstructions: "",
      waterRequirements: "",
      expectedWeight: "",
      conversionRate: "",
      isActive: true,
      createdBy: "مدير النظام"
    });
    setEditingId(null);
    setShowForm(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const poultryTypes = ["دجاج لاحم", "دجاج بياض", "بط", "حمام", "سمان", "ديك رومي"];
  const feedTypes = ["بادئ", "نامي", "ناهي", "بياض", "خاص"];

  return (
    <div className="container mx-auto p-6">
      {/* رسائل التنبيه */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg text-right ${
          message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* الهيدر */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {showForm ? "إلغاء" : "+ خطة جديدة"}
          </button>
        </div>
        <h2 className="text-2xl font-bold text-right">📊 خطط تغذية الدواجن</h2>
      </div>

      {/* البحث والفلترة */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded text-right"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            بحث
          </button>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">جميع الأنواع</option>
            {poultryTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* نموذج الإضافة/التعديل */}
      {showForm && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 text-right">
            {editingId ? "تعديل خطة التغذية" : "إضافة خطة تغذية جديدة"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-right mb-2">اسم الخطة *</label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">نوع الدواجن *</label>
                <select
                  name="poultryType"
                  value={formData.poultryType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                >
                  {poultryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-right mb-2">الفئة العمرية *</label>
                <input
                  type="text"
                  name="ageRange"
                  value={formData.ageRange}
                  onChange={handleInputChange}
                  placeholder="مثال: 1-7 أيام"
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">نوع العلف *</label>
                <select
                  name="feedType"
                  value={formData.feedType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                >
                  {feedTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-right mb-2">الكمية اليومية (جرام/طائر) *</label>
                <input
                  type="number"
                  name="dailyAmount"
                  value={formData.dailyAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">عدد مرات التغذية *</label>
                <input
                  type="number"
                  name="feedingFrequency"
                  value={formData.feedingFrequency}
                  onChange={handleInputChange}
                  min="1"
                  max="6"
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">نسبة البروتين (%) *</label>
                <input
                  type="number"
                  name="proteinPercentage"
                  value={formData.proteinPercentage}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">محتوى الطاقة (كيلو كالوري/كجم) *</label>
                <input
                  type="number"
                  name="energyContent"
                  value={formData.energyContent}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">المكونات *</label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">المكملات الغذائية</label>
                <textarea
                  name="supplements"
                  value={formData.supplements}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded text-right"
                />
              </div>
              <div>
                <label className="block text-right mb-2">الفيتامينات</label>
                <textarea
                  name="vitamins"
                  value={formData.vitamins}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded text-right"
                />
              </div>
              <div>
                <label className="block text-right mb-2">يوم البدء *</label>
                <input
                  type="number"
                  name="startDay"
                  value={formData.startDay}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">يوم الانتهاء *</label>
                <input
                  type="number"
                  name="endDay"
                  value={formData.endDay}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                  required
                />
              </div>
              <div>
                <label className="block text-right mb-2">الوزن المتوقع (جرام)</label>
                <input
                  type="number"
                  name="expectedWeight"
                  value={formData.expectedWeight}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded text-right"
                />
              </div>
              <div>
                <label className="block text-right mb-2">معدل تحويل العلف</label>
                <input
                  type="number"
                  name="conversionRate"
                  value={formData.conversionRate}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full p-2 border rounded text-right"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-right mb-2">تعليمات خاصة</label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border rounded text-right"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-right mb-2">متطلبات المياه</label>
                <textarea
                  name="waterRequirements"
                  value={formData.waterRequirements}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded text-right"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {loading ? "جاري الحفظ..." : editingId ? "تحديث" : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* عرض خطط التغذية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">جاري التحميل...</div>
        ) : feedingPlans.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            لا توجد خطط تغذية حالياً
          </div>
        ) : (
          feedingPlans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                <h3 className="text-white font-bold text-lg text-right">{plan.planName}</h3>
                <p className="text-green-100 text-right text-sm">{plan.poultryType}</p>
              </div>
              <div className="p-4">
                <div className="space-y-2 text-right">
                  <p><strong className="text-gray-700">الفئة العمرية:</strong> {plan.ageRange}</p>
                  <p><strong className="text-gray-700">نوع العلف:</strong> {plan.feedType}</p>
                  <p><strong className="text-gray-700">الكمية اليومية:</strong> {plan.dailyAmount} جرام/طائر</p>
                  <p><strong className="text-gray-700">مرات التغذية:</strong> {plan.feedingFrequency} مرات/يوم</p>
                  <p><strong className="text-gray-700">البروتين:</strong> {plan.proteinPercentage}%</p>
                  <p><strong className="text-gray-700">الطاقة:</strong> {plan.energyContent} كيلو كالوري/كجم</p>
                  <p><strong className="text-gray-700">المدة:</strong> يوم {plan.startDay} - يوم {plan.endDay}</p>
                  {plan.expectedWeight && (
                    <p><strong className="text-gray-700">الوزن المتوقع:</strong> {plan.expectedWeight} جرام</p>
                  )}
                  <div className="pt-3 flex gap-2 justify-end border-t">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedingPlans;