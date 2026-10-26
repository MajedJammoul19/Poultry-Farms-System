import { useEffect, useState, useRef } from 'react';
import { Mail, MapPin, Phone, Save, Store, User as UserIcon } from 'lucide-react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAuth from '../../hooks/use-auth';
import { updateTraderProfile } from '../../api/auth';

const FIELD_LIMITS = {
  name:        50,
  companyName: 100,
  phone:       25,
  address:     200,
};

const FoodSupplierProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name:        '',
    companyName: '',
    email:       '',
    phone:       '',
    address:     '',
  });
  const [errors, setErrors]           = useState({});
  const [successMsg, setSuccessMsg]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const successTimer = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name:        user.name        || '',
        companyName: user.companyName || '',
        email:       user.email       || '',
        phone:       user.phone       || '',
        address:     user.address     || '',
      });
    }
  }, [user]);

  useEffect(() => () => clearTimeout(successTimer.current), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const max = FIELD_LIMITS[name];
    setFormData(prev => ({
      ...prev,
      [name]: max ? value.slice(0, max) : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};

    if (!formData.name.trim())
      next.name = 'اسم التاجر مطلوب';

    if (!formData.email.trim()) {
      next.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (formData.phone.trim() && !/^[\d\s()+-]{6,25}$/.test(formData.phone.trim()))
      next.phone = 'رقم الهاتف غير صالح (6-25 رقم/رمز)';

    if (formData.address.trim().length > 200)
      next.address = 'العنوان يجب ألا يتجاوز 200 حرف';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await updateTraderProfile({
        name:        formData.name.trim(),
        companyName: formData.companyName.trim(),
        email:       formData.email.trim(),
        phone:       formData.phone.trim(),
        address:     formData.address.trim(),
      });

      updateUser(result.user);
      setSuccessMsg('تم تحديث بيانات الحساب بنجاح ✅');
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrors({ form: err.message || 'تعذر تحديث بيانات الحساب' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-800 ' +
    'placeholder-gray-400 outline-none transition ' +
    'focus:border-orange-500 focus:ring-2 focus:ring-orange-100';

  const initials = (user?.name || 'ت').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto" dir="rtl">

          {/* ===== رأس الصفحة ===== */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-6 flex items-center gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                {user?.name || 'الملف الشخصي'}
              </h1>
              <p className="text-orange-100 text-sm mt-0.5">
                {user?.companyName ? user.companyName : 'تاجر مواد غذائية'}
              </p>
              <span className="inline-block mt-1.5 px-3 py-0.5 bg-white/20 text-white text-xs rounded-full">
                🍽️ تاجر مواد غذائية
              </span>
            </div>
          </div>

          {/* ===== بطاقة النموذج ===== */}
          <div className="bg-white rounded-2xl shadow border border-gray-100">

            {/* رأس البطاقة */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-orange-500" />
                معلومات الحساب وبيانات التواصل
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                عدّل بياناتك وسيتم تحديث الملف الشخصي فور الحفظ
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

              {/* رسالة خطأ عامة */}
              {errors.form && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  ⚠️ {errors.form}
                </div>
              )}

              {/* رسالة نجاح */}
              {successMsg && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  {successMsg}
                </div>
              )}

              {/* شبكة الحقول */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* اسم التاجر */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Store className="w-4 h-4 text-orange-500" />
                    اسم التاجر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    placeholder="الاسم الكامل"
                    className={`${inputBase} ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name}</p>
                  )}
                  <p className="text-gray-400 text-xs text-left" dir="ltr">
                    {formData.name.length}/{FIELD_LIMITS.name}
                  </p>
                </div>

                {/* اسم الشركة */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Store className="w-4 h-4 text-orange-500" />
                    اسم الشركة
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="اسم الشركة أو المؤسسة"
                    className={inputBase}
                  />
                  <p className="text-gray-400 text-xs text-left" dir="ltr">
                    {formData.companyName.length}/{FIELD_LIMITS.companyName}
                  </p>
                </div>

                {/* البريد الإلكتروني */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 text-orange-500" />
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="supplier@example.com"
                    className={`${inputBase} ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    dir="ltr"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* رقم الهاتف */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone className="w-4 h-4 text-orange-500" />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={25}
                    placeholder="+963 900 000 000"
                    className={`${inputBase} ${errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                    dir="ltr"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* العنوان */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  العنوان
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength={200}
                  rows={3}
                  placeholder="عنوان الشركة أو المستودع"
                  className={`${inputBase} resize-y min-h-[80px] ${errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">{errors.address}</p>
                )}
                <p className="text-gray-400 text-xs text-left" dir="ltr">
                  {formData.address.length}/{FIELD_LIMITS.address}
                </p>
              </div>

              {/* زر الحفظ */}
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FoodSupplierProfilePage;
