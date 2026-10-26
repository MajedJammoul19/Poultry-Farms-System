import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';

const SYSTEM_FEATURES = [
  { icon: '🐔', title: 'إدارة الإنتاج', desc: 'تتبع الدواجن والإنتاج اليومي بدقة عالية' },
  { icon: '🩺', title: 'الصحة البيطرية', desc: 'فحوصات طبية وخطط وقاية متكاملة' },
  { icon: '🌾', title: 'التغذية والإمدادات', desc: 'خطط غذائية يومية وطلبات منتظمة' },
  { icon: '⛽', title: 'إدارة الوقود', desc: 'تتبع الاستهلاك والفواتير والموردين' },
  { icon: '📊', title: 'تقارير ذكية', desc: 'إحصاءات وتحليلات في الوقت الفعلي' },
  { icon: '🗓️', title: 'الحضور والانصراف', desc: 'سجل حضور إلكتروني شامل للموظفين' },
];

const ROLES = [
  { icon: '👑', label: 'أدمن النظام',         color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25' },
  { icon: '🏗️', label: 'مدير المنشأة',        color: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  { icon: '👷', label: 'موظف',         color: 'bg-green-400/15 text-green-300 border-green-400/25' },
  { icon: '🩺', label: 'طبيب بيطري',          color: 'bg-red-500/15 text-red-300 border-red-500/25' },
  { icon: '🌾', label: 'تاجر مواد غذائية',   color: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  { icon: '⛽', label: 'تاجر وقود',           color: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
];

const EyeOffIcon = () => (
  <svg className="h-4.5 w-4.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PoultryFarmSignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    { value: 'admin',         label: 'أدمن النظام' },
    { value: 'manager',       label: 'مدير المنشأة' },
    { value: 'employee',      label: 'موظف' },
    { value: 'vet',           label: 'طبيب بيطري' },
    { value: 'food_supplier', label: 'تاجر مواد غذائية' },
    { value: 'fuel_supplier', label: 'تاجر وقود' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'بريد إلكتروني غير صالح';
    }
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        const newEmployee = {
          id: Date.now(),
          name: formData.name,
          position: formData.role === 'employee' ? 'موظف' :
                    formData.role === 'admin' ? 'مسؤول' :
                    formData.role === 'vet' ? 'طبيب بيطري' :
                    formData.role === 'food_supplier' ? 'تاجر مواد غذائية' :
                    'تاجر وقود التدفئة'
        };

        const existingEmployees = JSON.parse(localStorage.getItem('employees')) || [];
        localStorage.setItem('employees', JSON.stringify([...existingEmployees, newEmployee]));

        navigate('/sign-in');
      } catch (error) {
        setErrors({ form: error.message || 'فشل تسجيل الحساب. الرجاء المحاولة مرة أخرى.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#eef6e8] dark:bg-[#0d1a12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#eef6e8] via-[#f2f8ee] to-[#e5f3dc] dark:from-[#0d1a12] dark:via-[#0f1f17] dark:to-[#0a180f]" />
      <div
        className="absolute inset-0 opacity-25 dark:opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(22,101,52,0.14) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 min-h-screen flex">

        {/* LEFT: Info Panel */}
        <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col bg-gradient-to-br from-green-700 via-green-800 to-emerald-950 relative overflow-hidden" dir='rtl'> 
          <div className="relative z-10 flex flex-col p-10 xl:p-12 h-full">
            {/* Logo */}
            <div className="flex items-center gap-3.5 mb-10">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-lg">
                🐔
              </div>
              <div>
                <div className="text-white font-bold text-base leading-tight">مزرعة الدواجن السعيدة</div>
                <div className="text-green-300/65 text-xs mt-0.5">Poultry Farm Management System</div>
              </div>
            </div>

            {/* Headline */}
            <div className="mb-8" dir='rtl'>
              <h1 className="text-white font-bold text-[1.75rem] leading-snug mb-3">
                أهلاً بك في<br />منصة الدواجن الذكية
              </h1>
              <p className="text-green-200/70 text-sm leading-relaxed">
                نظام متكامل لإدارة مزارع الدواجن يجمع بين سهولة الاستخدام والقدرات التحليلية المتقدمة لتحقيق أعلى إنتاجية ممكنة
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-2.5 mb-8" dir='rtl'>
              {SYSTEM_FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-white/8 hover:bg-white/12 rounded-xl border border-white/10 transition-colors duration-200 animate-featureIn"
                  style={{ animationDelay: `${0.07 * i}s` }}
                >
                  <div className="w-8 h-8 bg-white/12 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold leading-tight">{f.title}</div>
                    <div className="text-green-300/60 text-xs mt-0.5 leading-snug">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Roles */}
            <div className="mt-auto" dir='rtl'>
              <p className="text-green-400/50 text-xs font-semibold uppercase tracking-widest mb-3">الأدوار المتاحة</p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${r.color}`}
                  >
                    {r.icon} {r.label}
                  </span>
                ))}
              </div>

              {/* Bottom stats */}
              <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-3">
                {[{ num: '6+', label: 'أدوار' }, { num: '20+', label: 'تقرير' }, { num: '24/7', label: 'دعم' }].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-white font-bold text-lg">{s.num}</div>
                    <div className="text-green-400/50 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="flex-1 overflow-y-auto flex items-start xl:items-center justify-center p-5 py-8">

          {/* Mobile header */}
          <div className="w-full max-w-md mx-auto">
            <div className="lg:hidden flex items-center gap-3 mb-5 p-4 bg-gradient-to-r from-green-700 to-emerald-800 rounded-2xl text-white shadow-lg">
              <span className="text-3xl">🐔</span>
              <div>
                <div className="font-bold text-sm">مزرعة الدواجن السعيدة</div>
                <div className="text-green-300/70 text-xs">نظام إدارة متكامل للدواجن</div>
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white/90 dark:bg-[#0f1f17]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_32px_80px_-16px_rgba(20,83,45,0.3)] border border-white/50 dark:border-green-900/40 p-7 animate-pageLoad">

              {/* Header */}
              <div className="text-center mb-6 animate-pageTitle">
                <div className="inline-flex w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl items-center justify-center shadow-lg shadow-green-500/25 mb-3 animate-pageIcon">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">تسجيل حساب جديد</h2>
                <p className="text-xs text-gray-500 dark:text-green-400/60 mt-1">انضم إلى منصة إدارة مزرعة الدواجن</p>
              </div>

              {/* Global error */}
              {errors.form && (
                <div className="mb-5 p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/40 animate-pageError">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="animate-pageField" style={{ animationDelay: '0.15s' }}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>الاسم الكامل</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 text-gray-800 dark:text-green-50 placeholder-gray-400 dark:placeholder-green-800/70 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-fadeIn">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="animate-pageField" style={{ animationDelay: '0.25s' }}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>البريد الإلكتروني</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 text-gray-800 dark:text-green-50 placeholder-gray-400 dark:placeholder-green-800/70 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                      placeholder="example@domain.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-fadeIn">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="animate-pageField" style={{ animationDelay: '0.35s' }}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>كلمة المرور</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pr-11 pl-11 py-2.5 rounded-xl border border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 text-gray-800 dark:text-green-50 placeholder-gray-400 dark:placeholder-green-800/70 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                      placeholder="أدخل كلمة المرور"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-green-600 dark:text-green-700 dark:hover:text-green-400 transition-colors">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-fadeIn">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="animate-pageField" style={{ animationDelay: '0.45s' }}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>تأكيد كلمة المرور</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pr-11 pl-11 py-2.5 rounded-xl border border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 text-gray-800 dark:text-green-50 placeholder-gray-400 dark:placeholder-green-800/70 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                      placeholder="أعد إدخال كلمة المرور"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-green-600 dark:text-green-700 dark:hover:text-green-400 transition-colors">
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 dark:text-red-400 animate-fadeIn">{errors.confirmPassword}</p>}
                </div>

                {/* Role */}
                <div className="animate-pageField" style={{ animationDelay: '0.55s' }}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>نوع المستخدم</label>
                  <div className="relative" dir='rtl'>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 text-gray-800 dark:text-green-50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      {roles.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2 animate-pageButton" style={{ animationDelay: '0.65s' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2.5"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        جاري التسجيل...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        تسجيل الحساب
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center animate-pageField" style={{ animationDelay: '0.75s' }}>
                  <p className="text-sm text-gray-500 dark:text-green-500/60">
                    لديك حساب بالفعل؟{' '}
                    <Link to="/sign-in" className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors">
                      تسجيل الدخول
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pageLoad { from { opacity:0 } to { opacity:1 } }
        @keyframes pageTitle { from { opacity:0; transform:translateY(-14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pageIcon { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
        @keyframes pageField { from { opacity:0; transform:translateX(14px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pageButton { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pageError { from { opacity:0; transform:translateX(-12px) } to { opacity:1; transform:translateX(0) } }
        @keyframes featureIn { from { opacity:0; transform:translateX(-10px) } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        .animate-pageLoad { animation: pageLoad 0.4s ease-out; }
        .animate-pageTitle { animation: pageTitle 0.5s ease-out forwards; opacity:0; }
        .animate-pageIcon { animation: pageIcon 0.5s ease-out forwards; opacity:0; }
        .animate-pageField { animation: pageField 0.5s ease-out forwards; opacity:0; }
        .animate-pageButton { animation: pageButton 0.5s ease-out forwards; opacity:0; }
        .animate-pageError { animation: pageError 0.4s ease-out forwards; opacity:0; }
        .animate-featureIn { animation: featureIn 0.5s ease-out forwards; opacity:0; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PoultryFarmSignUp;
