import React, { useState } from 'react';
import { createExamination } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const MedicalCheckForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: '',
    vetName: '',
    location: '',
    chickenCount: '',
    healthStatus: '',
    dailyMortalityCount: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    // التحقق من وجود التوكن قبل الإرسال
    const token = localStorage.getItem('token');
    console.log('🔑 MedicalForm - التوكن:', token ? 'موجود' : 'غير موجود');
    
    if (!token) {
      setErrorMessage('الرجاء تسجيل الدخول أولاً');
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // تسجيل قيمة dailyMortalityCount قبل التحويل
      console.log('🔍 قيمة dailyMortalityCount من الفورم:', formData.dailyMortalityCount);
      console.log('🔍 نوع dailyMortalityCount:', typeof formData.dailyMortalityCount);
      
      // تحويل البيانات إلى الأرقام المناسبة
      const examinationData = {
        date: formData.date,
        vetName: formData.vetName,
        location: formData.location,
        chickenCount: parseInt(formData.chickenCount),
        healthStatus: formData.healthStatus,
        dailyMortalityCount: formData.dailyMortalityCount ? parseInt(formData.dailyMortalityCount) : 0,
        notes: formData.notes,
      };
      
      console.log('📋 البيانات المرسلة إلى الخادم:', examinationData);
      console.log('📋 dailyMortalityCount المرسل:', examinationData.dailyMortalityCount, 'نوعه:', typeof examinationData.dailyMortalityCount);
      
      // Send to API
      const response = await createExamination(examinationData);
      
      console.log('✅ استجابة الخادم:', response);
      
      // Save to localStorage for the charts
      const existingExaminations = JSON.parse(localStorage.getItem('medicalExaminations')) || [];
      const newExamination = {
        id: Date.now(),
        date: formData.date,
        vetName: formData.vetName,
        location: formData.location,
        chickenCount: parseInt(formData.chickenCount),
        healthStatus: formData.healthStatus,
        dailyMortalityCount: formData.dailyMortalityCount ? parseInt(formData.dailyMortalityCount) : 0,
        notes: formData.notes,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('medicalExaminations', JSON.stringify([...existingExaminations, newExamination]));
      
      // Update medication/vaccine data based on health status
      updateMedicationData(newExamination);
      
      alert("تم تسجيل الفحص الطبي بنجاح");
      
      // إعادة تعيين النموذج
      setFormData({
        date: '',
        vetName: '',
        location: '',
        chickenCount: '',
        healthStatus: '',
        dailyMortalityCount: '',
        notes: ''
      });
      
      // التوجيه إلى صفحة التقارير
      navigate('/health-reports');
      
    } catch (error) {
      console.log("❌ حدث خطأ:", error);
      
      // معالجة أنواع مختلفة من الأخطاء
      if (error.message.includes('401') || error.response?.status === 401) {
        setErrorMessage("انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          navigate('/sign-in');
        }, 2000);
      } else if (error.response?.data?.error) {
        if (Array.isArray(error.response.data.error)) {
          setErrorMessage(error.response.data.error.join('\n'));
        } else {
          setErrorMessage(error.response.data.error);
        }
      } else {
        setErrorMessage(error.message || "حدث خطأ في تسجيل الفحص");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateMedicationData = (examination) => {
    // Get existing medication reports
    const existingMedications = JSON.parse(localStorage.getItem('medicationReports')) || [];
    
    // Create medication/vaccine record based on health status
    let medicationRecord = null;
    
    if (examination.healthStatus === 'غير صحي') {
      // If chickens are unhealthy, add medication records
      const medications = [
        { name: 'مضاد حيوي', quantity: Math.ceil(examination.chickenCount / 100) },
        { name: 'فيتامينات', quantity: Math.ceil(examination.chickenCount / 50) },
        { name: 'مطهر', quantity: Math.ceil(examination.chickenCount / 200) }
      ];
      
      medications.forEach(med => {
        medicationRecord = {
          date: examination.date,
          type: med.name,
          quantity: med.quantity,
          chickenCount: examination.chickenCount,
          vetName: examination.vetName,
          reason: 'علاج due to health issues'
        };
        
        existingMedications.push(medicationRecord);
      });
    } else {
      // If healthy, add vaccine records
      const vaccines = [
        { name: 'لقاح نيوكاسل', quantity: Math.ceil(examination.chickenCount / 100) },
        { name: 'لقاح إنفلونزا', quantity: Math.ceil(examination.chickenCount / 100) },
        { name: 'لقاح جدري', quantity: Math.ceil(examination.chickenCount / 150) }
      ];
      
      vaccines.forEach(vaccine => {
        medicationRecord = {
          date: examination.date,
          type: vaccine.name,
          quantity: vaccine.quantity,
          chickenCount: examination.chickenCount,
          vetName: examination.vetName,
          reason: 'فحص دوري صحي'
        };
        
        existingMedications.push(medicationRecord);
      });
    }
    
    localStorage.setItem('medicationReports', JSON.stringify(existingMedications));
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">نموذج تسجيل الفحوصات الطبية</h2>
      
      {/* عرض رسالة الخطأ */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-right">
          <p className="font-bold">خطأ:</p>
          <p className="whitespace-pre-line">{errorMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">تاريخ الفحص:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">اسم الطبيب البيطري:</label>
          <input
            type="text"
            name="vetName"
            value={formData.vetName}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">موقع المزرعة:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">عدد الدجاج:</label>
          <input
            type="number"
            name="chickenCount"
            value={formData.chickenCount}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">عدد حالات الوفيات اليومية:</label>
          <input
            type="number"
            name="dailyMortalityCount"
            value={formData.dailyMortalityCount}
            onChange={handleChange}
            min="0"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            // placeholder="أدخل عدد الطيور التي نفقت اليوم"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">حالة الصحة:</label>
          <select
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">اختر حالة الصحة</option>
            <option value="صحي">صحي</option>
            <option value="غير صحي">غير صحي</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ملاحظات:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md transition duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isSubmitting ? 'جاري التسجيل...' : 'تقديم الفحص'}
        </button>
      </form>
    </div>
  );
};

export default MedicalCheckForm;