import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Phone, Mail, X, Shield, FileText } from 'lucide-react';

const Portal = ({ children }) => ReactDOM.createPortal(children, document.body);

const SupportModal = ({ onClose }) => (
  <Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/50 overflow-hidden">

          {/* رأس مضغوط */}
          <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-4 py-3 text-white flex justify-between items-center">
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold flex items-center gap-2 text-sm">
              🐔 الدعم الفني
              <Phone className="w-4 h-4" />
            </h3>
          </div>

          {/* جهات الاتصال */}
          <div className="p-3 space-y-2" dir="rtl">

            {/* مجد جمول */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">م</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">مجد جمول</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">مطور النظام 🐓</p>
                </div>
              </div>
              <button
                onClick={() => window.open('tel:+963996164249')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
              >
                <Phone className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-bold text-green-600 dark:text-green-400">+963 996 164 249</span>
              </button>
            </div>

            {/* علاء كرمة */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">ع</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">علاء كرمة</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">مطور النظام 🐥</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => window.open('tel:+963997923937')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <Phone className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">+963 997 923 937</span>
                </button>
                <button
                  onClick={() => window.open('mailto:alaakarma2003264@gmail.com')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 truncate">alaakarma2003264@gmail.com</span>
                </button>
              </div>
            </div>
          </div>

          {/* إغلاق */}
          <div className="px-3 pb-3">
            <button onClick={onClose} className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              إغلاق 🐓
            </button>
          </div>
        </div>
      </div>
    </div>
  </Portal>
);

const PrivacyModal = ({ onClose }) => (
  <Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-5 text-white">
            <div className="flex justify-between items-center">
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <div className="text-right">
                <h3 className="text-xl font-bold flex items-center gap-2 justify-end">سياسة الخصوصية <Shield className="w-6 h-6" /></h3>
                <p className="text-blue-100 text-sm mt-0.5">آخر تحديث: يوليو 2026</p>
              </div>
            </div>
          </div>
          <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4" dir="rtl">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2"><span>🔐</span> البيانات التي نجمعها</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>بيانات الحساب: الاسم، البريد الإلكتروني، الدور الوظيفي</li>
                <li>بيانات التشغيل: سجلات الحضور، الطلبات، التقارير اليومية</li>
                <li>بيانات الجلسة: وقت الدخول، عنوان IP، نوع الجهاز</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30">
              <h4 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2 mb-2"><span>🎯</span> كيف نستخدم بياناتك</h4>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1 list-disc list-inside">
                <li>تشغيل النظام وإدارة صلاحيات المستخدمين</li>
                <li>توليد التقارير الإدارية والمالية للمزرعة</li>
                <li>تتبع الحضور والانصراف وساعات العمل</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
              <h4 className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-2"><span>🛡️</span> حماية البيانات</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1 list-disc list-inside">
                <li>تشفير جميع البيانات باستخدام بروتوكول AES-256</li>
                <li>كلمات المرور مشفرة ولا يمكن الاطلاع عليها</li>
                <li>الوصول مقيَّد بالصلاحيات — كل مستخدم يرى دوره فقط</li>
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
              <h4 className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-2"><span>👁️</span> حقوقك</h4>
              <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1 list-disc list-inside">
                <li>حق الاطلاع على بياناتك الشخصية المخزَّنة</li>
                <li>حق تصحيح البيانات غير الدقيقة</li>
                <li>حق طلب حذف حسابك من النظام</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">للاستفسار تواصل مع الدعم الفني 🐔</p>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">فهمت، شكراً 🐥</button>
          </div>
        </div>
      </div>
    </div>
  </Portal>
);

const TermsModal = ({ onClose }) => (
  <Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-emerald-200/50 dark:border-emerald-800/50 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white">
            <div className="flex justify-between items-center">
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <div className="text-right">
                <h3 className="text-xl font-bold flex items-center gap-2 justify-end">الشروط والأحكام <FileText className="w-6 h-6" /></h3>
                <p className="text-emerald-100 text-sm mt-0.5">سارية المفعول منذ يناير 2026</p>
              </div>
            </div>
          </div>
          <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4" dir="rtl">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-2"><span>📋</span> شروط استخدام النظام</h4>
              <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1 list-disc list-inside">
                <li>النظام مخصص حصراً لموظفي ومتعاملي مزرعة الدواجن السعيدة</li>
                <li>يُمنع مشاركة بيانات الدخول مع أي طرف ثالث</li>
                <li>يجب الإبلاغ الفوري عن أي اختراق أو استخدام غير مصرح به</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2"><span>👤</span> مسؤوليات المستخدم</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>الحفاظ على سرية كلمة المرور وتغييرها دورياً</li>
                <li>إدخال البيانات بدقة وأمانة في جميع التقارير</li>
                <li>تسجيل الحضور والانصراف الفعلي دون تزوير</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
              <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2 mb-2"><span>🚫</span> المخالفات والعواقب</h4>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                <li>انتهاك شروط الاستخدام يُفضي إلى إيقاف الحساب فوراً</li>
                <li>التلاعب بالبيانات يخضع للمساءلة القانونية والإدارية</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">باستخدامك للنظام فأنت توافق على جميع الشروط والأحكام 🐔</p>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">أوافق على الشروط والأحكام 🐓</button>
          </div>
        </div>
      </div>
    </div>
  </Portal>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showSupport, setShowSupport] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <>
      <footer className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 border-t border-green-700/50 py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-2xl animate-bounce">🐔</span>
                <p className="text-sm text-green-200">© {currentYear} نظام إدارة مزرعة الدواجن السعيدة</p>
                <span className="text-2xl animate-bounce delay-100">🐥</span>
              </div>
              <p className="text-xs text-green-300/70 mt-1">جميع الحقوق محفوظة | Poultry Management System</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <button
                onClick={() => setShowTerms(true)}
                className="text-xs text-green-300 hover:text-green-100 transition-colors duration-300 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                الشروط والأحكام
              </button>
              <span className="text-green-600/50 text-xs">|</span>
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-xs text-green-300 hover:text-green-100 transition-colors duration-300 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                سياسة الخصوصية
              </button>
              <span className="text-green-600/50 text-xs">|</span>
              <button
                onClick={() => setShowSupport(true)}
                className="text-xs text-green-300 hover:text-green-100 transition-colors duration-300 flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                الدعم الفني
              </button>
            </div>
          </div>
        </div>
      </footer>

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showPrivacy  && <PrivacyModal  onClose={() => setShowPrivacy(false)}  />}
      {showTerms    && <TermsModal    onClose={() => setShowTerms(false)}    />}
    </>
  );
};

export default Footer;
