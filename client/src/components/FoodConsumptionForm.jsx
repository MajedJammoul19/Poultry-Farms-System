import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createFoodConsumption } from '../api/auth';

const POULTRY_TYPES   = ['صيصان', 'دجاج لاحم', 'دجاج بياض'];
const FEED_TYPES      = ['بادئ', 'نامي', 'ناهي', 'بياض', 'خاص'];
const HEALTH_STATUSES = ['ممتاز', 'جيد', 'متوسط', 'ضعيف', 'حرج'];

const EMPTY_FORM = {
  recordDate:      new Date().toISOString().split('T')[0],
  poultryType:     'دجاج لاحم',
  batchNumber:     '',
  birdCount:       '',
  averageAge:      '',
  dailyConsumption:'',
  feedType:        'بادئ',
  feedBrand:       '',
  conversionRate:  '',
  feedCost:        '',
  healthStatus:    'جيد',
  temperature:     '',
  notes:           '',
};

const inputClass =
  'w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg ' +
  'focus:ring-2 focus:ring-orange-400 focus:outline-none ' +
  'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm';

const labelClass = 'block text-right mb-2 text-gray-700 dark:text-gray-300 text-sm font-medium';

const Field = ({ label, required, children }) => (
  <div>
    <label className={labelClass}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const FoodConsumptionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      setFormData(EMPTY_FORM);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFoodConsumption({
        ...formData,
        dailyConsumption: parseFloat(formData.dailyConsumption),
        birdCount:        parseInt(formData.birdCount),
        averageAge:       parseInt(formData.averageAge),
        conversionRate:   formData.conversionRate  ? parseFloat(formData.conversionRate)  : undefined,
        feedCost:         formData.feedCost         ? parseFloat(formData.feedCost)         : undefined,
        temperature:      formData.temperature      ? parseFloat(formData.temperature)      : undefined,
      });
      toast.success('تم تسجيل استهلاك الغذاء بنجاح 🌾');
      showMessage('success', 'تم تسجيل استهلاك الغذاء بنجاح');
      setFormData(EMPTY_FORM);
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء التسجيل');
      showMessage('error', err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      {/* رسائل التنبيه */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg text-right ${
          message.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-400 dark:border-green-700'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* الهيدر */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white text-right">
          🌾 التغذية العامة
        </h1>
        <p className="text-amber-100 text-right mt-2">
          سجل بيانات استهلاك الأعلاف اليومي للقطيع
        </p>
      </div>

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        {/* معلومات الدفعة */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-100">
            معلومات الدفعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="تاريخ التسجيل" required>
              <input
                type="date"
                name="recordDate"
                value={formData.recordDate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>

            <Field label="نوع الدواجن" required>
              <select
                name="poultryType"
                value={formData.poultryType}
                onChange={handleChange}
                required
                className={inputClass + ' cursor-pointer'}
              >
                {POULTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="رقم الدفعة" required>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                placeholder="مثال: BATCH-001"
                className={inputClass}
              />
            </Field>

            <Field label="عدد الطيور" required>
              <input
                type="number"
                name="birdCount"
                value={formData.birdCount}
                onChange={handleChange}
                required
                min="1"
                placeholder="0"
                className={inputClass}
              />
            </Field>

            <Field label="متوسط العمر (أيام)" required>
              <input
                type="number"
                name="averageAge"
                value={formData.averageAge}
                onChange={handleChange}
                required
                min="1"
                placeholder="0"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* استهلاك العلف */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-100">
            استهلاك العلف
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <label className="block text-right mb-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                الاستهلاك اليومي (كجم) *
              </label>
              <input
                type="number"
                name="dailyConsumption"
                value={formData.dailyConsumption}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                placeholder="0.0"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <Field label="نوع العلف" required>
              <select
                name="feedType"
                value={formData.feedType}
                onChange={handleChange}
                required
                className={inputClass + ' cursor-pointer'}
              >
                {FEED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="ماركة العلف">
              <input
                type="text"
                name="feedBrand"
                value={formData.feedBrand}
                onChange={handleChange}
                placeholder="اختياري"
                className={inputClass}
              />
            </Field>

            <Field label="معدل تحويل العلف">
              <input
                type="number"
                name="conversionRate"
                value={formData.conversionRate}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="مثال: 1.8"
                className={inputClass}
              />
            </Field>

            <Field label="تكلفة العلف (لكل كجم)">
              <input
                type="number"
                name="feedCost"
                value={formData.feedCost}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-right mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-gray-100">
            معلومات إضافية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الحالة الصحية">
              <select
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                className={inputClass + ' cursor-pointer'}
              >
                {HEALTH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="درجة الحرارة (مئوية)">
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                step="0.1"
                placeholder="مثال: 25"
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="ملاحظات">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="أي ملاحظات إضافية..."
                  className={inputClass + ' resize-none'}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            ← رجوع
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg transition"
            >
              مسح البيانات
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري التسجيل...
                </span>
              ) : 'تسجيل الاستهلاك'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FoodConsumptionForm;
