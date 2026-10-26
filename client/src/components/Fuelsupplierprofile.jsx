import React, { useEffect, useState } from 'react';
import { verifyMe, updateTraderProfile } from '../api/auth';

// Lets a logged-in fuel supplier view and edit their own profile (FS-09).
// Reuses the existing /auth/profile endpoint - updateProfile on the
// backend now accepts both food_supplier and fuel_supplier roles.
const FuelSupplierProfile = () => {
  const emptyForm = { name: '', email: '', companyName: '', phone: '', address: '' };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await verifyMe(); // GET /auth/me
      if (res?.user) {
        const u = res.user;
        setForm({
          name: u.name || '',
          email: u.email || '',
          companyName: u.companyName || '',
          phone: u.phone || '',
          address: u.address || '',
        });
      } else {
        setError('تعذر تحميل بيانات الملف الشخصي');
      }
    } catch (err) {
      setError('تعذر تحميل بيانات الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateTraderProfile(form); // PUT /auth/profile
      setSuccess('تم تحديث بياناتك بنجاح');
    } catch (err) {
      setError(err.message || 'تعذر تحديث بيانات الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

  if (loading)
    return <p className="text-gray-500 text-sm p-4">...جاري تحميل البيانات</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-4 max-w-md space-y-3"
    >
      <h3 className="text-lg font-semibold text-gray-800">
        بياناتي الشخصية
      </h3>

      <div>
        <label className="block text-xs text-gray-600 mb-1">الاسم</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">البريد الإلكتروني</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">اسم الشركة</label>
        <input
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">رقم الهاتف</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">العنوان</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-md py-2 transition-colors"
      >
        {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
      </button>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
    </form>
  );
};

export default FuelSupplierProfile;