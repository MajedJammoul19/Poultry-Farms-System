import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { AuthContext } from '../context/auth-context';

const PANEL_FEATURES = [
  { icon: '🐔', text: 'إدارة الدواجن والإنتاج' },
  { icon: '🩺', text: 'الصحة البيطرية والوقاية' },
  { icon: '🌾', text: 'خطط التغذية والإمدادات' },
  { icon: '⛽', text: 'إدارة الوقود والمستودعات' },
  { icon: '📊', text: 'تقارير وإحصاءات تفصيلية' },
  { icon: '👥', text: 'إدارة الموظفين والحضور' },
];

const EyeOffIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PoultryFarmSignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(''); // Server errors
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useContext(AuthContext); // saving user's information in local storage
  const navigate = useNavigate();

  const navigateByRole = (role) => {
    if (role === 'vet') navigate('/health-checks', { replace: true });
    else if (role === 'fuel_supplier') navigate('/fuel', { replace: true });
    else if (role === 'food_supplier') navigate('/food', { replace: true });
    else navigate('/dashbourd', { replace: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    // Clear the field error immediately upon starting to type.
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (loginError) setLoginError('');
  };

  // Form's Data Validation 
  const validateForm = () => {
    setErrors({});

    // 1. Is the email written ?
    if (!formData.email.trim()) {
      setErrors({ email: 'البريد الإلكتروني مطلوب' });
      return false;
    }

    // 2. Is the email's form true ?
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'صيغة البريد الإلكتروني غير صحيحة' });
      return false;
    }
    
    // 3. Is the password true (we arrived here only if the email was true)
    if (!formData.password) {
      setErrors({ password: 'كلمة المرور مطلوبة' });
      return false;
    }

    return true;
  };


  // Form's information sending
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setLoginError('');

    console.log('🚀 1. بدأ تسجيل الدخول:', formData.email);

    if (validateForm()) {
      console.log('✅ 2. التحقق من صحة البيانات نجح');
      setIsSubmitting(true);

      try {
        console.log('⏳ 3. جاري استدعاء API...');
        const { user } = await login(formData.email, formData.password);

        try {
          signIn(user);
          sessionStorage.setItem('lastLoginTime', Date.now().toString()); 
        } catch (contextError) {
          console.log('❌ خطأ في التخزين:', contextError);
        }

        setTimeout(() => {
          navigateByRole(user.role);
        }, 500);
      } catch (error) {
        console.log('❌ خطأ في API:', error);
        if (error.errorCode === 'EMAIL_NOT_FOUND') {
          setErrors(prev => ({ ...prev, email: 'هذا البريد الإلكتروني غير مسجل في النظام' }));
        } else if (error.errorCode === 'WRONG_PASSWORD') {
          setErrors(prev => ({ ...prev, password: 'كلمة المرور غير صحيحة، تحقق منها وأعد المحاولة' }));
        } else {
          setLoginError(error.message || 'فشل تسجيل الدخول، حاول مرة أخرى');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('❌ فشل التحقق من صحة البيانات');
    }
  };

  return (
    <div className="min-h-screen bg-[#edf5e8] dark:bg-[#0f1f17] relative overflow-hidden animate-pageLoad">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

        {/* Light mode gradient base */}
        <div className="absolute inset-0 dark:hidden" style={{
          background: [
            'radial-gradient(ellipse 100% 80% at 8% 0%,  rgba(167,243,208,0.42) 0%, transparent 54%)',
            'radial-gradient(ellipse 80%  70% at 92% 8%,  rgba(253,224,71, 0.18) 0%, transparent 50%)',
            'radial-gradient(ellipse 60%  70% at 50% 100%,rgba(16,185,129, 0.22) 0%, transparent 54%)',
            'radial-gradient(ellipse 44%  44% at 50% 48%, rgba(255,255,255,0.68) 0%, transparent 65%)',
            'linear-gradient(148deg,#ecf6e7 0%,#f4f9ef 40%,#eaf4e3 72%,#e2f0da 100%)'
          ].join(',')
        }} />

        {/* Dark mode gradient base */}
        <div className="absolute inset-0 hidden dark:block" style={{
          background: [
            'radial-gradient(ellipse 100% 80% at 8% 0%,  rgba(21,128,61, 0.20) 0%, transparent 54%)',
            'radial-gradient(ellipse 80%  70% at 92% 8%,  rgba(161,98,7,  0.07) 0%, transparent 50%)',
            'radial-gradient(ellipse 60%  70% at 50% 100%,rgba(4,120,87,  0.18) 0%, transparent 54%)',
            'linear-gradient(148deg,#0b1810 0%,#0e1e12 40%,#0b1a0f 72%,#08160c 100%)'
          ].join(',')
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-[2.5rem] overflow-hidden
          shadow-[0_20px_60px_-8px_rgba(20,83,45,0.28),0_52px_120px_-24px_rgba(20,83,45,0.22)]
          dark:shadow-[0_20px_60px_-8px_rgba(20,83,45,0.55),0_52px_120px_-24px_rgba(16,185,129,0.18)]
          border border-white/50 dark:border-green-800/25">

          {/* Left: Branding Panel */}
          <div className="hidden md:flex md:w-[42%] bg-gradient-to-br from-green-700 via-green-800 to-emerald-950 flex-col justify-between p-10 relative overflow-hidden" dir='rtl'>
            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-10">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-lg">
                  🐔
                </div>
                <div>
                  <div className="text-white font-bold text-base leading-tight">مزرعة الدواجن السعيدة</div>
                  <div className="text-green-300/70 text-xs mt-0.5">Poultry Farm System v2.0</div>
                </div>
              </div>

              <h2 className="text-white font-bold text-2xl leading-snug mb-3">
                منصة إدارة المزارع الذكية
              </h2>
              <p className="text-green-200/75 text-sm leading-relaxed mb-8">
                نظام متكامل يشمل جميع جوانب إدارة مزرعة الدواجن من الإنتاج حتى التسويق
              </p>

              <div className="space-y-3">
                {PANEL_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pageField" style={{ animationDelay: `${0.08 * i}s` }}>
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-base flex-shrink-0 border border-white/10">
                      {f.icon}
                    </div>
                    <span className="text-green-100/85 text-sm">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 grid grid-cols-3 gap-3">
              {[{ num: '6+', label: 'أدوار' }, { num: '20+', label: 'تقرير' }, { num: '24/7', label: 'دعم' }].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-white font-bold text-xl">{s.num}</div>
                  <div className="text-green-400/60 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form Panel */}
          <div className="flex-1 bg-white/88 dark:bg-[#0d1f16]/92 backdrop-blur-2xl p-8 lg:p-12 flex flex-col justify-center">

            {/* Mobile logo */}
            <div className="md:hidden flex items-center justify-center gap-2.5 mb-6 pb-6 border-b border-gray-100 dark:border-green-900/30">
              <span className="text-3xl">🐔</span>
              <div>
                <div className="text-green-700 dark:text-green-400 font-bold text-base leading-tight">مزرعة الدواجن السعيدة</div>
                <div className="text-gray-400 dark:text-green-700 text-xs">Poultry Farm System</div>
              </div>
            </div>

            {/* Form header */}
            <div className="text-center mb-8 animate-pageTitle">
              <div className="inline-flex w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl items-center justify-center shadow-lg shadow-green-500/25 mb-4 animate-pageIcon">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white animate-pageTitle" style={{ animationDelay: '0.1s' }}>
                تسجيل الدخول
              </h2>
              <p className="text-sm text-gray-500 dark:text-green-400/60 mt-1 animate-pageTitle" style={{ animationDelay: '0.2s' }}>
                أدخل بياناتك للوصول إلى لوحة التحكم
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 flex items-center gap-2.5 text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/40 animate-pageError">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="animate-pageField" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>
                  البريد الإلكتروني
                </label>
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
                    className={`w-full pr-11 pl-4 py-3 rounded-xl border transition-all duration-200 text-gray-800 dark:text-green-50 placeholder-gray-400 dark:placeholder-green-800/80 focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.email
                        ? 'border-red-400 dark:border-red-600 bg-red-50/60 dark:bg-red-950/20 focus:ring-red-400/40'
                        : 'border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 focus:ring-green-500/50'
                    }`}
                    placeholder="example@domain.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1 animate-fadeIn">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="animate-pageField" style={{ animationDelay: '0.4s' }}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-green-200 mb-1.5" dir='rtl'>
                  كلمة المرور
                </label>
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
                    className={`w-full pr-11 pl-11 py-3 rounded-xl border transition-all duration-200 text-gray-800 dark:text-green-50 placeholder-gray-400 dark:placeholder-green-800/80 focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.password
                        ? 'border-red-400 dark:border-red-600 bg-red-50/60 dark:bg-red-950/20 focus:ring-red-400/40'
                        : 'border-gray-200 dark:border-green-900/50 bg-gray-50 dark:bg-green-950/25 focus:ring-green-500/50'
                    }`}
                    placeholder="كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-green-600 dark:text-green-700 dark:hover:text-green-400 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1 animate-fadeIn">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1 animate-pageButton" style={{ animationDelay: '0.6s' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      تسجيل الدخول
                    </>
                  )}
                </button>
              </div>

              <div className="text-center animate-pageField" style={{ animationDelay: '0.7s' }}>
                <p className="text-sm text-gray-500 dark:text-green-500/60">
                  ليس لديك حساب؟{' '}
                  <Link to="/" className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors">
                    إنشاء حساب جديد
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pageLoad { from { opacity:0 } to { opacity:1 } }
        @keyframes pageTitle { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pageIcon { from { opacity:0; transform:scale(0.8) } to { opacity:1; transform:scale(1) } }
        @keyframes pageField { from { opacity:0; transform:translateX(14px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pageButton { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pageError { from { opacity:0; transform:translateX(-12px) } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        .animate-pageLoad { animation: pageLoad 0.4s ease-out; }
        .animate-pageTitle { animation: pageTitle 0.5s ease-out forwards; opacity:0; }
        .animate-pageIcon { animation: pageIcon 0.5s ease-out forwards; opacity:0; }
        .animate-pageField { animation: pageField 0.5s ease-out forwards; opacity:0; }
        .animate-pageButton { animation: pageButton 0.5s ease-out forwards; opacity:0; }
        .animate-pageError { animation: pageError 0.4s ease-out forwards; opacity:0; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default PoultryFarmSignIn;
