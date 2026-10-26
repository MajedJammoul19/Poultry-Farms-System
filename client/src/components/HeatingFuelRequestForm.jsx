import React, { useState, useEffect } from 'react';
import { createFuelOrder, getFuelSuppliersAvailability } from '../api/auth';
import useAuth from '../hooks/use-auth';

const HeatingFuelRequestForm = () => {
  const { userRole } = useAuth();
  const isManager = userRole === 'manager';

  const [formData, setFormData] = useState({
    facilityName:  '',
    ownerName:     '',
    contactNumber: '',
    fuelType:      '',
    quantity:      '',
    deliveryDate:  '',
    supplierId:    '',
  });

  const [suppliers, setSuppliers]           = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [successMsg, setSuccessMsg]         = useState('');
  const [errorMsg, setErrorMsg]             = useState('');

  useEffect(() => {
    if (!isManager) return;
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const res = await getFuelSuppliersAvailability();
        if (res.success) setSuppliers(res.data);
      } catch {
        // تُترك القائمة فارغة عند الفشل
      } finally {
        setLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, [isManager]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (isManager && !formData.supplierId) {
      setErrorMsg('يرجى اختيار تاجر الوقود أولاً');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        facilityName:  formData.facilityName,
        ownerName:     formData.ownerName,
        contactNumber: formData.contactNumber,
        fuelType:      formData.fuelType,
        quantity:      Number(formData.quantity),
        deliveryDate:  formData.deliveryDate,
      };
      if (isManager && formData.supplierId) {
        payload.supplierId = formData.supplierId;
      }

      await createFuelOrder(payload);
      setSuccessMsg('تم إرسال الطلب بنجاح');
      setFormData({
        facilityName: '', ownerName: '', contactNumber: '',
        fuelType: '', quantity: '', deliveryDate: '', supplierId: '',
      });
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s._id === formData.supplierId);

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">طلب وقود التدفئة</h2>
        <p className="text-center text-gray-400 text-sm mb-6">أدخل تفاصيل الطلب بالكامل</p>

        {/* رسائل النجاح/الخطأ */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium text-center">
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ===== قسم اختيار تاجر الوقود — للمدير فقط ===== */}
        {isManager && (
          <div className="supplier-selector-box mb-5 p-4 rounded-xl bg-orange-50 border border-orange-200">
            <label className="block font-semibold mb-2 text-sm text-gray-700">
              🏪 تاجر الوقود <span className="text-red-500">*</span>
            </label>

            {loadingSuppliers ? (
              <p className="text-sm text-gray-400 py-2">جارٍ تحميل قائمة التجار...</p>
            ) : suppliers.length === 0 ? (
              <p className="supplier-no-data text-sm text-orange-600 py-2">
                لا يوجد تجار وقود مسجلون في النظام حالياً
              </p>
            ) : (
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                required={isManager}
                className="supplier-select w-full p-2.5 border border-orange-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              >
                <option value="">— اختر تاجر الوقود —</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                    {supplier.companyName ? ` — ${supplier.companyName}` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* معلومات التاجر المختار */}
            {selectedSupplier && (
              <div className="supplier-info-card mt-3 flex items-center gap-3 bg-white rounded-lg p-3 border border-orange-200">
                <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {selectedSupplier.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{selectedSupplier.name}</p>
                  {selectedSupplier.companyName && (
                    <p className="text-gray-500 text-xs">{selectedSupplier.companyName}</p>
                  )}
                  {selectedSupplier.phone && (
                    <p className="text-gray-400 text-xs">📞 {selectedSupplier.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== حقول النموذج ===== */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">اسم المنشأة</label>
          <input
            type="text"
            name="facilityName"
            value={formData.facilityName}
            onChange={handleChange}
            required
            placeholder="مثال: مزرعة الأمل"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">اسم المالك</label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
            placeholder="الاسم الكامل"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">رقم الاتصال</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            placeholder="05xxxxxxxx"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">نوع الوقود</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white"
          >
            <option value="">اختر نوع الوقود</option>
            <option value="ديزل">الديزل</option>
            <option value="غاز طبيعي">الغاز الطبيعي</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm font-medium">الكمية المطلوبة (لتر)</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min={1}
            max={100000}
            placeholder="مثال: 500"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2 text-sm font-medium">تاريخ التسليم المطلوب</label>
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            required
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || (isManager && suppliers.length === 0)}
          className="w-full py-3 rounded-xl font-semibold text-white transition bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
        </button>
      </form>
    </div>
  );
};

export default HeatingFuelRequestForm;
