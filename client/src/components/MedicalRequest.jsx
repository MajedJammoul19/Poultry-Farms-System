import React, { useState } from "react";
import axios from "axios";

const MedicalRequestForm = () => {
  const [formData, setFormData] = useState({
    requestDate: new Date().toISOString().split('T')[0],
    facilityName: "",
    ownerName: "",
    contactNumber: "",
    poultryType: "دجاج لاحم",
    birdCount: "",
    averageAge: "",
    affectedCount: "",
    mortalityCount: "",
    symptoms: "",
    symptomsStartDate: new Date().toISOString().split('T')[0],
    clinicalSigns: "",
    treatmentType: "مضاد حيوي",
    medicationName: "",
    dosage: "",
    duration: "",
    administrationMethod: "عن طريق الماء",
    previousTreatments: "",
    labResults: "",
    priority: "متوسط",
    notes: "",
    requesterName: "",
    requesterEmail: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitted, setSubmitted] = useState(false);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        "http://localhost:5000/api/medical-requests",
        formData
      );
      
      if (response.data.success) {
        setMessage({
          type: "success",
          text: `تم إرسال الطلب الطبي بنجاح! رقم الطلب: ${response.data.data.requestNumber}`
        });
        setSubmitted(true);
        
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "حدث خطأ أثناء إرسال الطلب"
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع البيانات؟")) {
      setFormData({
        requestDate: new Date().toISOString().split('T')[0],
        facilityName: "",
        ownerName: "",
        contactNumber: "",
        poultryType: "دجاج لاحم",
        birdCount: "",
        averageAge: "",
        affectedCount: "",
        mortalityCount: "",
        symptoms: "",
        symptomsStartDate: new Date().toISOString().split('T')[0],
        clinicalSigns: "",
        treatmentType: "مضاد حيوي",
        medicationName: "",
        dosage: "",
        duration: "",
        administrationMethod: "عن طريق الماء",
        previousTreatments: "",
        labResults: "",
        priority: "متوسط",
        notes: "",
        requesterName: "",
        requesterEmail: ""
      });
    }
  };

  const poultryTypes = ["دجاج لاحم", "دجاج بياض", "بط", "حمام", "سمان", "ديك رومي", "أخرى"];
  const treatmentTypes = ["مضاد حيوي", "فيتامينات", "لقاح", "مضاد طفيليات", "مطهر", "أخرى"];
  const administrationMethods = ["عن طريق العلف", "عن طريق الماء", "حقن", "رش", "قطرة", "أخرى"];
  const priorities = ["عاجل", "مرتفع", "متوسط", "منخفض"];

  if (submitted) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">تم إرسال الطلب بنجاح!</h2>
          <p className="text-lg mb-4">{message.text}</p>
          <p className="text-sm mb-6">سيتم مراجعة طلبك والتواصل معك قريباً</p>
          <button
            onClick={() => {
              setSubmitted(false);
              handleReset();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            تقديم طلب جديد
          </button>
        </div>
      </div>
    );
  }

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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white text-right">
          🏥 طلب خدمة طبية بيطرية
        </h1>
        <p className="text-green-100 text-right mt-2">
          قدم طلباً للحصول على خدمات طبية بيطرية للدواجن
        </p>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
        {/* معلومات المنشأة */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات المنشأة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right mb-2">اسم المنشأة *</label>
              <input
                type="text"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">اسم المالك *</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">رقم الاتصال *</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">تاريخ الطلب *</label>
              <input
                type="date"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {/* معلومات الدواجن */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات الدواجن</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right mb-2">نوع الدواجن *</label>
              <select
                name="poultryType"
                value={formData.poultryType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              >
                {poultryTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-right mb-2">عدد الطيور *</label>
              <input
                type="number"
                name="birdCount"
                value={formData.birdCount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">متوسط العمر (أيام) *</label>
              <input
                type="number"
                name="averageAge"
                value={formData.averageAge}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">عدد الطيور المصابة</label>
              <input
                type="number"
                name="affectedCount"
                value={formData.affectedCount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-right mb-2">عدد النافق</label>
              <input
                type="number"
                name="mortalityCount"
                value={formData.mortalityCount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
          </div>
        </div>

        {/* الأعراض والتشخيص */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">الأعراض والتشخيص</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-right mb-2">الأعراض *</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border rounded-lg text-right"
                placeholder="صف الأعراض التي تظهر على الطيور..."
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">تاريخ بدء الأعراض *</label>
              <input
                type="date"
                name="symptomsStartDate"
                value={formData.symptomsStartDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">العلامات السريرية</label>
              <textarea
                name="clinicalSigns"
                value={formData.clinicalSigns}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2 border rounded-lg text-right"
                placeholder="أي علامات سريرية ملاحظة..."
              />
            </div>
          </div>
        </div>

        {/* العلاج المطلوب */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">العلاج المطلوب</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right mb-2">نوع العلاج *</label>
              <select
                name="treatmentType"
                value={formData.treatmentType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              >
                {treatmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-right mb-2">اسم الدواء *</label>
              <input
                type="text"
                name="medicationName"
                value={formData.medicationName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">الجرعة *</label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="مثال: 1 جم لكل لتر ماء"
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">مدة العلاج *</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="مثال: 5 أيام"
                className="w-full p-2 border rounded-lg text-right"
                required
              />
            </div>
            <div>
              <label className="block text-right mb-2">طريقة الإعطاء *</label>
              <select
                name="administrationMethod"
                value={formData.administrationMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              >
                {administrationMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-right mb-2">الأولوية *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
                required
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات إضافية</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-right mb-2">العلاجات السابقة</label>
              <textarea
                name="previousTreatments"
                value={formData.previousTreatments}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2 border rounded-lg text-right"
                placeholder="أي علاجات تم إعطاؤها سابقاً..."
              />
            </div>
            <div>
              <label className="block text-right mb-2">نتائج التحاليل المخبرية</label>
              <textarea
                name="labResults"
                value={formData.labResults}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2 border rounded-lg text-right"
                placeholder="أي نتائج تحاليل متوفرة..."
              />
            </div>
            <div>
              <label className="block text-right mb-2">ملاحظات إضافية</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2 border rounded-lg text-right"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>
        </div>

        {/* معلومات مقدم الطلب */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b pb-2">معلومات مقدم الطلب (اختياري)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right mb-2">الاسم</label>
              <input
                type="text"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-right mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="requesterEmail"
                value={formData.requesterEmail}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-right"
              />
            </div>
          </div>
        </div>

        {/* أزرار */}
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "جاري الإرسال..." : "إرسال الطلب"}
          </button>
        </div>
      </form>

      {/* معلومات هامة */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-bold text-right text-blue-800 mb-2">ℹ️ معلومات هامة</h4>
        <ul className="text-right text-sm text-blue-700 space-y-1">
          <li>• سيتم مراجعة طلبك من قبل فريقنا البيطري خلال 24 ساعة</li>
          <li>• في الحالات العاجلة يرجى الاتصال على الرقم الموحد</li>
          <li>• سيتم إرسال رقم تتبع للطلب يمكنك استخدامه لمتابعة الحالة</li>
          <li>• تأكد من صحة البيانات المدخلة لتسريع عملية المعالجة</li>
        </ul>
      </div>
    </div>
  );
};

export default MedicalRequestForm;