import React, { useState, useEffect } from "react";
import axios from "axios";

const ManagerRecommendations = () => {
  const [recommendations, setRecommendations] = useState({
    productivityIssues: "",
    improvementSuggestions: "",
    requiredResources: "",
    expectedOutcomes: "",
    additionalNotes: "",
    priority: "متوسط",
    submitterName: "",
    submitterEmail: "",
  });

  const [allRecommendations, setAllRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // وضع المدير (للتعديل والحذف)
  const [adminMode, setAdminMode] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // جلب التوصيات عند تحميل المكون
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // دالة جلب جميع التوصيات
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/manager-recommendations"
      );
      if (response.data.success) {
        setAllRecommendations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError("حدث خطأ أثناء جلب التوصيات");
    } finally {
      setLoading(false);
    }
  };

  // دالة إرسال توصية جديدة
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من وجود محتوى في الحقول الأساسية
    if (!recommendations.productivityIssues.trim() || 
        !recommendations.improvementSuggestions.trim()) {
      setError("الرجاء تعبئة حقول المشاكل والحلول المقترحة");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/manager-recommendations",
        recommendations
      );

      if (response.data.success) {
        setSuccessMessage("تم إرسال التوصية بنجاح!");
        setSubmitted(true);
        
        // إعادة تعيين النموذج
        setRecommendations({
          productivityIssues: "",
          improvementSuggestions: "",
          requiredResources: "",
          expectedOutcomes: "",
          additionalNotes: "",
          priority: "متوسط",
          submitterName: "",
          submitterEmail: "",
        });
        
        // إعادة تحميل القائمة
        fetchRecommendations();
        
        // إخفاء رسالة النجاح بعد 3 ثواني
        setTimeout(() => {
          setSubmitted(false);
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting recommendation:", error);
      setError(error.response?.data?.message || "حدث خطأ أثناء إرسال التوصية");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // دالة تحديث الحالة (للمدير فقط)
  const handleUpdateStatus = async (id, status, reviewNotes = "") => {
    if (!adminSecret) {
      setError("الرجاء إدخال رمز المدير");
      return false;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/manager-recommendations/${id}/status`,
        {
          status,
          reviewNotes,
          adminSecret,
        }
      );

      if (response.data.success) {
        setSuccessMessage("تم تحديث حالة التوصية بنجاح");
        fetchRecommendations();
        return true;
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError(error.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
      return false;
    }
    return false;
  };

  // دالة حذف توصية (للمدير فقط)
  const handleDelete = async (id) => {
    if (!adminSecret) {
      setError("الرجاء إدخال رمز المدير");
      return;
    }

    if (!window.confirm("هل أنت متأكد من حذف هذه التوصية؟")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/manager-recommendations/${id}`,
        {
          data: { adminSecret },
        }
      );

      if (response.data.success) {
        setSuccessMessage("تم حذف التوصية بنجاح");
        fetchRecommendations();
        setShowAdminModal(false);
      }
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      setError(error.response?.data?.message || "حدث خطأ أثناء حذف التوصية");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecommendations({
      ...recommendations,
      [name]: value,
    });
  };

  const handleClear = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع الحقول؟")) {
      setRecommendations({
        productivityIssues: "",
        improvementSuggestions: "",
        requiredResources: "",
        expectedOutcomes: "",
        additionalNotes: "",
        priority: "متوسط",
        submitterName: "",
        submitterEmail: "",
      });
    }
  };

  // دالة للحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case "قيد المراجعة":
        return "bg-yellow-100 text-yellow-800";
      case "قيد التنفيذ":
        return "bg-blue-100 text-blue-800";
      case "تم التنفيذ":
        return "bg-green-100 text-green-800";
      case "مرفوض":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // دالة للحصول على لون الأولوية
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "عالي":
        return "bg-red-100 text-red-800";
      case "متوسط":
        return "bg-yellow-100 text-yellow-800";
      case "منخفض":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (submitted && !showList) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-right">
          <strong className="font-bold">تم الإرسال بنجاح!</strong>
          <span className="block sm:inline"> {successMessage || "تم حفظ توصياتك بنجاح. شكراً لمساهمتك في تحسين الإنتاجية."}</span>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          إضافة توصية جديدة
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* رسائل الخطأ والنجاح */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-right">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-right">
          {successMessage}
        </div>
      )}

      {/* نموذج إرسال التوصية */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h2 className="text-2xl font-bold text-white text-right">
            📋 توصيات لتحسين الإنتاجية
          </h2>
          <p className="text-blue-100 text-right mt-2">
            قم بتقديم توصياتك لتحسين أداء التقارير وزيادة الإنتاجية
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* اسم المرسل (اختياري) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-right">
                الاسم (اختياري)
              </label>
              <input
                type="text"
                name="submitterName"
                value={recommendations.submitterName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="أدخل اسمك"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-right">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                name="submitterEmail"
                value={recommendations.submitterEmail}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="example@domain.com"
              />
            </div>
          </div>

          {/* الأولوية */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2 text-right">
              الأولوية
            </label>
            <select
              name="priority"
              value={recommendations.priority}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="عالي">عالي</option>
              <option value="متوسط">متوسط</option>
              <option value="منخفض">منخفض</option>
            </select>
          </div>

          {/* المشاكل الحالية */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2 text-right">
              المشاكل الحالية في الإنتاجية *
            </label>
            <textarea
              name="productivityIssues"
              value={recommendations.productivityIssues}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="اذكر المشاكل التي تواجهها في الإنتاجية حالياً..."
              required
            />
          </div>

          {/* الحلول المقترحة */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2 text-right">
              الحلول والتحسينات المقترحة *
            </label>
            <textarea
              name="improvementSuggestions"
              value={recommendations.improvementSuggestions}
              onChange={handleInputChange}
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="اقترح حلولاً عملية لتحسين الإنتاجية..."
              required
            />
          </div>

          {/* الموارد المطلوبة */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2 text-right">
              الموارد المطلوبة
            </label>
            <textarea
              name="requiredResources"
              value={recommendations.requiredResources}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="ما هي الموارد التي تحتاجها؟"
            />
          </div>

          {/* النتائج المتوقعة */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2 text-right">
              النتائج المتوقعة
            </label>
            <textarea
              name="expectedOutcomes"
              value={recommendations.expectedOutcomes}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="ما هي النتائج المتوقعة؟"
            />
          </div>

          {/* ملاحظات إضافية */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2 text-right">
              ملاحظات إضافية
            </label>
            <textarea
              name="additionalNotes"
              value={recommendations.additionalNotes}
              onChange={handleInputChange}
              rows="2"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              مسح الحقول
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              {showPreview ? "إخفاء المعاينة" : "معاينة التوصيات"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "جاري الإرسال..." : "إرسال التوصيات"}
            </button>
          </div>

          {/* المعاينة */}
          {showPreview && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-right mb-4">معاينة التوصيات</h3>
              <div className="space-y-3 text-right">
                <div>
                  <strong className="text-blue-600">المشاكل الحالية:</strong>
                  <p className="mt-1">{recommendations.productivityIssues || "لم يتم الإدخال بعد"}</p>
                </div>
                <div>
                  <strong className="text-blue-600">الحلول المقترحة:</strong>
                  <p className="mt-1">{recommendations.improvementSuggestions || "لم يتم الإدخال بعد"}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* زر عرض التوصيات السابقة */}
      <div className="mb-4">
        <button
          onClick={() => {
            setShowList(!showList);
            if (!showList) fetchRecommendations();
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {showList ? "إخفاء التوصيات السابقة" : `عرض التوصيات السابقة (${allRecommendations.length})`}
        </button>
        
        {/* زر تفعيل وضع المدير */}
        <button
          onClick={() => setAdminMode(!adminMode)}
          className="mr-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {adminMode ? "إخفاء أدوات المدير" : "أدوات المدير"}
        </button>
      </div>

      {/* رمز المدير */}
      {adminMode && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <label className="block text-right mb-2 font-bold">رمز المدير:</label>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            className="w-64 p-2 border rounded text-right"
            placeholder="أدخل رمز المدير"
          />
        </div>
      )}

      {/* قائمة التوصيات السابقة */}
      {showList && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gray-800 p-4">
            <h3 className="text-white font-bold text-right">التوصيات السابقة</h3>
          </div>
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {allRecommendations.map((rec) => (
                <div key={rec._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(rec.status)}`}>
                        {rec.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(rec.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <div className="text-right">
                    {rec.submitterName && (
                      <p className="text-sm text-gray-600">
                        <strong>الاسم:</strong> {rec.submitterName}
                      </p>
                    )}
                    <p className="text-sm mt-1">
                      <strong>المشاكل:</strong> {rec.productivityIssues.substring(0, 100)}...
                    </p>
                    <p className="text-sm mt-1">
                      <strong>الحلول:</strong> {rec.improvementSuggestions.substring(0, 100)}...
                    </p>
                    
                    {/* أدوات المدير */}
                    {adminMode && adminSecret && (
                      <div className="mt-3 flex gap-2 justify-end">
                        <select
                          onChange={(e) => handleUpdateStatus(rec._id, e.target.value, "تمت المراجعة")}
                          value={rec.status}
                          className="text-sm p-1 border rounded"
                        >
                          <option value="قيد المراجعة">قيد المراجعة</option>
                          <option value="قيد التنفيذ">قيد التنفيذ</option>
                          <option value="تم التنفيذ">تم التنفيذ</option>
                          <option value="مرفوض">مرفوض</option>
                        </select>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {allRecommendations.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  لا توجد توصيات حالياً
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerRecommendations;