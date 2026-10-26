import React, { useState, useEffect, useRef } from "react";
import {
  Menu, Settings, HelpCircle,
  BarChart, AlertCircle,
  Phone, Mail, X, HelpCircle as HelpIcon, ChevronRight, ChevronDown, BookOpen, Video,
  SkipBack, SkipForward, Check, ArrowRight, Sun, Moon
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getQuickReport } from '../api/auth';
import AttendanceButtons from './AttendanceButtons';
import { useSidebar } from '../context/SidebarContext';

const WEATHER_STYLES = {
  hot:      { gradient: 'from-red-600 to-orange-500',  border: 'border-red-200/50 dark:border-red-800/50',    icon: '🔥', label: 'حار جداً',  tipClass: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200',    tip: 'زيادة التهوية، توفير الماء البارد، تقليل الكثافة' },
  cold:     { gradient: 'from-blue-700 to-cyan-600',   border: 'border-blue-200/50 dark:border-blue-800/50',  icon: '❄️', label: 'بارد جداً', tipClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',  tip: 'تدفئة الحظائر، تقليل التهوية المباشرة، زيادة العلف' },
  moderate: { gradient: 'from-green-600 to-teal-500',  border: 'border-green-200/50 dark:border-green-800/50', icon: '🌤️', label: 'معتدل',    tipClass: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200', tip: 'الطقس مناسب لنمو صحي للقطيع — واصل المراقبة المعتادة' },
  normal:   { gradient: 'from-slate-600 to-gray-500',  border: 'border-gray-200/50 dark:border-gray-700/50',  icon: '☁️', label: 'غير محدد', tipClass: 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300',  tip: 'اضغط على زر الطقس لجلب البيانات الحالية' },
};

const NOTIF_ITEMS = [
  { key: 'weather',    label: 'تنبيهات الطقس',    desc: 'تحذيرات درجات الحرارة القاسية',    icon: '🌡️', card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30'    },
  { key: 'orders',     label: 'تنبيهات الطلبات',  desc: 'إشعارات الطلبات الجديدة والمعلقة', icon: '📦', card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30' },
  { key: 'attendance', label: 'تنبيهات الحضور',   desc: 'تسجيل الحضور والانصراف اليومي',    icon: '✅', card: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30'   },
  { key: 'production', label: 'تنبيهات الإنتاج',  desc: 'تحديثات معدلات الإنتاج اليومية',   icon: '🥚', card: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30'   },
];

const PRIVACY_ITEMS = [
  { icon: '🔐', title: 'تشفير البيانات',      desc: 'جميع البيانات مشفرة باستخدام بروتوكول AES-256',         card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30'    },
  { icon: '👁️', title: 'التحكم بالوصول',     desc: 'كل مستخدم يرى فقط البيانات المرتبطة بصلاحياته',        card: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30'   },
  { icon: '🗑️', title: 'الاحتفاظ بالبيانات', desc: 'يتم الاحتفاظ بالسجلات لمدة 3 سنوات ثم حذفها آلياً',   card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30' },
  { icon: '📋', title: 'سجل النشاطات',        desc: 'يتم تسجيل جميع عمليات الدخول والتعديل تلقائياً',       card: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30' },
];

const ROUTE_NAMES = {
  '/dashbourd':               { ar: 'لوحة التحكم',               icon: '📊' },
  '/employee':                { ar: 'إدارة المستخدمين',          icon: '👥' },
  '/activity-logs':           { ar: 'سجلات الأنشطة',            icon: '📋' },
  '/settings':                { ar: 'إعدادات النظام',            icon: '⚙️' },
  '/resource-planning':       { ar: 'تخطيط الموارد',             icon: '📦' },
  '/packing-operations':      { ar: 'فرز وتعبئة',               icon: '🥚' },
  '/packing-reports':         { ar: 'تقارير الفرز',             icon: '📄' },
  '/productivity-reports':    { ar: 'سجلات الإنتاج',            icon: '📈' },
  '/daily-data':              { ar: 'تسجيل البيانات اليومية',   icon: '📝' },
  '/health-checks':           { ar: 'الفحوصات البيطرية',        icon: '🩺' },
  '/feeding-plans':           { ar: 'خطط التغذية',              icon: '🌾' },
  '/health-reports':          { ar: 'تقارير الفحوصات البيطرية', icon: '📋' },
  '/prevention-plans':        { ar: 'خطط الوقاية',              icon: '🛡️' },
  '/medication-requests':     { ar: 'طلب أدوية',               icon: '💊' },
  '/prevention-reports':      { ar: 'تقارير خطط الوقاية',      icon: '📄' },
  '/food-supplier-profile':   { ar: 'الملف الشخصي',            icon: '👤' },
  '/daily-feeding':           { ar: 'التغذية اليومية',          icon: '🌾' },
  '/general-feeding':         { ar: 'التغذية العامة',           icon: '🌾' },
  '/general-feeding-reports': { ar: 'تقارير التغذية العامة',   icon: '📄' },
  '/attendance-history':      { ar: 'سجل الحضور والانصراف',   icon: '🕐' },
  '/hygiene-reports':         { ar: 'بلاغات النظافة',          icon: '🧹' },
  '/hygiene-docs':            { ar: 'تقارير بلاغات النظافة',   icon: '📋' },
  '/fuel-suppliers-availability': { ar: 'مواعيد تجار الوقود',  icon: '⛽' },
  '/fuel':                    { ar: 'طلب وقود',                icon: '⛽' },
  '/food':                    { ar: 'طلب مواد غذائية',        icon: '🍽️' },
  '/pricing':                 { ar: 'عروض الأسعار',            icon: '💰' },
  '/price-history':           { ar: 'سجل الأسعار التاريخي',   icon: '📊' },
  '/fuel-reports':            { ar: 'سجلات طلبات الوقود',     icon: '📋' },
  '/food-consumption':        { ar: 'تسجيل استهلاك الأعلاف', icon: '🌾' },
  '/fuel-consumption':        { ar: 'استبيان استهلاك الوقود',  icon: '⛽' },
  '/fuel-consumption-reports':{ ar: 'تقارير استهلاك الوقود',  icon: '📄' },
  '/fuel-invoices':           { ar: 'الفواتير والمالية',       icon: '💳' },
  '/fuel-supplier-settings':  { ar: 'إعدادات التوريد',        icon: '⚙️' },
};

const Header = () => {
  const location = useLocation();
  const currentPage = ROUTE_NAMES[location.pathname];
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showQuickGuideModal, setShowQuickGuideModal] = useState(false);
  const [openFAQItems, setOpenFAQItems] = useState([]);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  const [weatherTemp, setWeatherTemp] = useState(() => {
    const t = sessionStorage.getItem('weatherTemp');
    return t ? parseFloat(t) : null;
  });
  const [weatherCondition, setWeatherCondition] = useState(
    () => sessionStorage.getItem('weatherCondition') || 'normal'
  );
  const [weatherData, setWeatherData] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('weatherData') || 'null'); }
    catch { return null; }
  });
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [weatherLoading,   setWeatherLoading]   = useState(false);
const [showReportModal,  setShowReportModal]  = useState(false);
  const [showNotifModal,   setShowNotifModal]   = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showBackupModal,  setShowBackupModal]  = useState(false);
  const [showSysInfoModal, setShowSysInfoModal] = useState(false);
  const [notifSettings, setNotifSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notifSettings') || 'null') || { weather: true, orders: true, attendance: true, production: false }; }
    catch { return { weather: true, orders: true, attendance: true, production: false }; }
  });
  const [reportData,      setReportData]      = useState(null);
  const [reportLoading,   setReportLoading]   = useState(false);
  const [currentReport,   setCurrentReport]   = useState({ title: '', icon: '', period: '' });
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  
  // Refs للتعامل مع الأزرار والقوائم
  const weatherRef = useRef(null);
  const dropdownRefs = {
    help: useRef(null),
    settings: useRef(null),
    reports: useRef(null),
  };

  // تفعيل المظهر الداكن/الفاتح
  useEffect(() => {
    
    
    // إغلاق القوائم عند النقر خارجها
    const handleClickOutside = (event) => {
      const insideDropdown = Object.values(dropdownRefs).some(
        ref => ref.current?.contains(event.target)
      );
      const insideButton = !!event.target.closest('.dropdown-button');
      if (!insideDropdown && !insideButton) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // فتح/إغلاق القائمة عند الضغط فقط
  const handleDropdownClick = (dropdownName) => {
    setActiveDropdown(prev => prev === dropdownName ? null : dropdownName);
  };

  // جلب بيانات الطقس من API
  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=24.71&longitude=46.67&current_weather=true'
      );
      const data = await response.json();
      const temp  = data.current_weather.temperature;
      const wind  = { speed: data.current_weather.windspeed, direction: data.current_weather.winddirection };
      const condition = temp <= 0 ? 'cold' : temp >= 40 ? 'hot' : 'moderate';

      setWeatherTemp(temp);
      setWeatherCondition(condition);
      setWeatherData(wind);
      sessionStorage.setItem('weatherTemp',      temp.toString());
      sessionStorage.setItem('weatherCondition', condition);
      sessionStorage.setItem('weatherData',      JSON.stringify(wind));
    } catch (err) {
      console.error('خطأ في جلب الطقس:', err);
      toast.error('تعذر الحصول على بيانات الطقس');
    } finally {
      setWeatherLoading(false);
    }
  };

  // فتح مودال الطقس — يجلب البيانات إذا لم تكن محملة
  const checkWeather = async () => {
    setShowWeatherModal(true);
    if (weatherTemp === null) {
      await fetchWeatherData();
    }
  };


  // دالة لفتح إشعار الدعم
  const openSupportModal = () => {
    setActiveDropdown(null);
    setShowSupportModal(true);
  };

  const closeSupportModal = () => {
    setShowSupportModal(false);
  };

  const openFAQModal = () => {
    setActiveDropdown(null);
    setShowFAQModal(true);
  };

  const closeFAQModal = () => {
    setShowFAQModal(false);
  };

  const openQuickGuideModal = () => {
    setActiveDropdown(null);
    setShowQuickGuideModal(true);
    setCurrentGuideStep(0);
  };

  const closeQuickGuideModal = () => {
    setShowQuickGuideModal(false);
    setCurrentGuideStep(0);
  };

  const nextGuideStep = () => {
    if (currentGuideStep < quickGuideSteps.length - 1) {
      setCurrentGuideStep(prev => prev + 1);
    } else {
      closeQuickGuideModal();
    }
  };

  const prevGuideStep = () => {
    if (currentGuideStep > 0) {
      setCurrentGuideStep(prev => prev - 1);
    }
  };

  const goToGuideStep = (stepIndex) => {
    setCurrentGuideStep(stepIndex);
  };

  const toggleFAQItem = (index) => {
    setOpenFAQItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  // خطوات الدليل السريع
  const quickGuideSteps = [
    {
      title: "🐔 مرحباً بك في نظام إدارة المنشأة الزراعية",
      description: "هذا الدليل السريع سيساعدك على التعرف على الميزات الأساسية للنظام والبدء في استخدامه بكفاءة.",
      icon: "🐓",
      features: [
        "🏠 إدارة شاملة لجميع عمليات المزرعة",
        "🩺 مراقبة صحة الطيور والإنتاج",
        "📦 تتبع المخزون والموارد",
        "📊 تقارير وتحليلات ذكية"
      ],
      duration: "2 دقائق"
    },
    {
      title: "📊 لوحة التحكم الرئيسية",
      description: "من هنا يمكنك رؤية نظرة عامة على أداء المزرعة والمؤشرات المهمة.",
      icon: "🐥",
      features: [
        "🥚 مؤشرات الأداء الرئيسية (KPI)",
        "📈 إحصائيات الإنتاج اليومي",
        "🩺 حالة صحة القطيع",
        "🔔 تنبيهات النظام المهمة"
      ],
      action: "التالي",
      actionPath: "/dashbourd"
    },
    {
      title: "🌤️ نظام مراقبة الطقس",
      description: "تابع حالة الطقس وتأثيرها على إنتاجية المزرعة.",
      icon: "🐓",
      features: [
        "🌡️ درجة الحرارة الحالية",
        "💨 سرعة الرياح واتجاهها",
        "⚠️ تنبيهات الطقس القاسي",
        "💡 توصيات ذكية للمزارعين"
      ],
      action: "التالي",
      actionFunction: checkWeather
    },
    {
      title: "📈 التقارير والتحليلات",
      description: "احصل على تقارير مفصلة وتحليلات ذكية لمساعدتك في اتخاذ القرارات.",
      icon: "🐔",
      features: [
        "🥚 تقارير الإنتاج الشهرية",
        "💰 تحليل التكاليف والأرباح",
        "📊 مقارنات الأداء",
        "🔮 تنبؤات ذكية بالإنتاج"
      ],
      action: "التالي",
    },
    {
      title: "🎉 أنت جاهز للبدء! 🐓",
      description: "لقد تعرفت على الميزات الأساسية. يمكنك الآن البدء في استخدام النظام بكفاءة.",
      icon: "🐥",
      features: [
        "📝 ابدأ بتسجيل الإنتاج اليومي",
        "📋 راجع التقارير الأسبوعية",
        "🌤️ تابع حالة الطقس يومياً",
        "🔔 استخدم التنبيهات للمهام المهمة"
      ],
      tips: [
        "💾 احفظ بياناتك بانتظام",
        "👀 راجع التنبيهات يومياً",
        "🔍 استخدم البحث للعثور على ما تريد بسرعة",
        "📞 لا تتردد في طلب المساعدة من الدعم"
      ]
    }
  ];

  // قائمة المساعدة السريعة
  const helpItems = [
    { title: "📖 الدليل السريع", icon: BookOpen, action: () => openQuickGuideModal() },
    { title: "🎥 فيديو تعريفي", icon: Video, action: () => window.open("https://youtube.com", "_blank") },
    { title: "❓ الأسئلة الشائعة", icon: HelpIcon, action: () => openFAQModal() },
    { title: "📞 اتصل بالدعم", icon: Phone, action: () => openSupportModal() },
  ];

  // قائمة الإعدادات السريعة
  const quickSettings = [
    { title: "🔔 إعدادات التنبيهات", icon: "🔔", action: () => { setShowNotifModal(true);   setActiveDropdown(null); } },
    { title: "🛡️ خصوصية البيانات",  icon: "🛡️", action: () => { setShowPrivacyModal(true);  setActiveDropdown(null); } },
    { title: "💾 نسخة احتياطية",     icon: "💾", action: () => { setShowBackupModal(true);   setActiveDropdown(null); } },
    { title: "ℹ️ معلومات النظام",    icon: "ℹ️", action: () => { setShowSysInfoModal(true);  setActiveDropdown(null); } },
  ];

  // تقارير سريعة — تجلب بيانات فعلية من قاعدة البيانات
  const quickReports = [
    { title: "📅 تقرير اليوم",    icon: "📅", action: () => fetchQuickReport('today',      'تقرير اليوم',    '📅') },
    { title: "📆 تقرير الأسبوع",  icon: "📆", action: () => fetchQuickReport('week',       'تقرير الأسبوع',  '📆') },
    { title: "🗓️ تقرير الشهر",   icon: "🗓️", action: () => fetchQuickReport('month',      'تقرير الشهر',   '🗓️') },
    { title: "🥚 تقرير الإنتاج",  icon: "🥚", action: () => fetchQuickReport('production', 'تقرير الإنتاج', '🥚') },
  ];

  const handleBackup = () => {
    console.log("🐔 جاري إنشاء نسخة احتياطية...");
    setTimeout(() => {
      toast.success("✅ تم إنشاء النسخة الاحتياطية بنجاح! 🐓");
      setActiveDropdown(null);
    }, 1000);
  };

  const toggleNotif = (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    localStorage.setItem('notifSettings', JSON.stringify(updated));
  };

  const fetchQuickReport = async (period, title, icon) => {
    setCurrentReport({ title, icon, period });
    setReportData(null);
    setReportLoading(true);
    setShowReportModal(true);
    setActiveDropdown(null);
    try {
      const res = await getQuickReport(period);
      if (res.success) setReportData(res);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportData = () => {
    console.log("جاري تصدير البيانات...");
    const data = {
      farmName: "🐔 مزرعة الدواجن الذكية",
      exportDate: new Date().toISOString(),
      version: "2.1.0",
      data: {
        birds: 5280,
        eggs: 4320,
        feed: 2.5,
        health: 98.5
      }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `farm-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('lastBackupDate', new Date().toLocaleString('ar-SA'));
    toast.success("📥 تم تصدير البيانات بنجاح! 🐔");
  };

  const handleImportData = () => {
    console.log("فتح محدد ملفات لاستيراد البيانات...");
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            console.log("✅ تم استيراد البيانات:", data);
            toast.success("✅ تم استيراد البيانات بنجاح! 🐓");
          } catch (error) {
            toast.error("❌ خطأ في قراءة الملف. يرجى التأكد من صحة البيانات.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const DropdownButton = ({ name, icon: Icon, title, children, buttonClass = "" }) => {
    const dropdownRef = useRef(null);
    const isOpen = activeDropdown === name;

    useEffect(() => {
      dropdownRefs[name] = dropdownRef;
    }, [name]);

    return (
      <div className="relative inline-block">
        {/* الزر */}
        <button
          className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-200 dropdown-button border ${
            isOpen
              ? 'bg-green-700/50 border-green-500/50 text-green-100 shadow-inner'
              : 'bg-green-800/30 hover:bg-green-700/40 border-transparent hover:border-green-600/30 text-green-300 hover:text-green-100'
          } ${buttonClass}`}
          title={title}
          onClick={() => handleDropdownClick(name)}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <ChevronDown
            className={`w-3 h-3 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* القائمة المنسدلة */}
        <div
          ref={dropdownRef}
          className={`absolute left-0 z-50 mt-2 w-72 origin-top transition-all duration-200 ease-out ${
            isOpen
              ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-y-90 -translate-y-3 pointer-events-none'
          }`}
          style={{ transformOrigin: 'top left' }}
        >
          {/* مثلث السهم */}
          <div className="absolute -top-[7px] left-4 w-3.5 h-3.5 rotate-45 rounded-tl-sm bg-white dark:bg-[#111827] border-l border-t border-green-200/60 dark:border-green-800/50 z-[-1]" />

          {/* محتوى القائمة */}
          <div className="relative overflow-hidden rounded-2xl bg-white/98 dark:bg-[#111827]/98 backdrop-blur-2xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.25),0_4px_16px_-4px_rgba(0,0,0,0.15)] border border-green-200/60 dark:border-green-800/40">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // دالة لتحديد لون أيقونة الطقس
  const getWeatherIconColor = () => {
    switch(weatherCondition) {
      case 'cold': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'hot': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'moderate': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-green-900 via-green-800 to-green-900 backdrop-blur-xl border-b border-green-700/50 shadow-xl relative" dir="ltr">

        {/* طبقة البلور فوق الهيدر عند فتح السايدبار — تمنع التفاعل وتغلق السايدبار بالضغط */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm cursor-pointer"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2 w-full">

            {/* ===== يسار: الأدوات (من أقصى اليسار ← المركز) ===== */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">

              {/* 1. تبديل المظهر */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-800/40 hover:bg-green-700/50 border border-green-600/30 hover:border-green-500/50 text-green-200 hover:text-green-100 rounded-xl transition-all duration-200"
                title={isDark ? 'العودة إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
                aria-label="تبديل المظهر الداكن"
              >
                {isDark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
                <span className="text-xs font-semibold hidden sm:inline">
                  {isDark ? 'فاتح' : 'داكن'}
                </span>
              </button>

              {/* فاصل */}
              <div className="hidden sm:block w-px h-7 bg-green-600/40 mx-0.5" />

              {/* 3. التقارير السريعة */}
              <DropdownButton name="reports" icon={BarChart} title="التقارير السريعة" buttonClass="group-hover:text-green-300">
                <div className="px-4 py-3 border-b border-green-100/20 dark:border-green-800/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">📊 التقارير السريعة</h3>
                </div>
                <div className="py-1">
                  {quickReports.map((item, index) => (
                    <button key={index} onClick={() => { item.action(); setActiveDropdown(null); }}
                      className="block w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-end gap-2">
                      <span className="text-lg">{item.icon}</span>
                      {item.title}
                    </button>
                  ))}
                </div>
              </DropdownButton>

              {/* 4. الإعدادات */}
              <DropdownButton name="settings" icon={Settings} title="الإعدادات السريعة" buttonClass="group-hover:text-green-300">
                <div className="px-4 py-3 border-b border-green-100/20 dark:border-green-800/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">⚙️ الإعدادات السريعة</h3>
                </div>
                <div className="py-1">
                  {quickSettings.map((item, index) => (
                    <button key={index} onClick={() => { item.action(); setActiveDropdown(null); }}
                      className="block w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center justify-end gap-2">
                      <span className="text-lg">{item.icon}</span>
                      {item.title}
                    </button>
                  ))}
                </div>
              </DropdownButton>

              {/* 5. المساعدة */}
              <DropdownButton name="help" icon={HelpCircle} title="المساعدة والدعم" buttonClass="group-hover:text-green-300">
                <div className="px-4 py-3 border-b border-green-100/20 dark:border-green-800/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h3 className="font-semibold text-green-800 dark:text-green-200">🐔 المساعدة والدعم</h3>
                </div>
                <div className="py-1">
                  {helpItems.map((item, index) => (
                    <button key={index} onClick={() => { item.action(); setActiveDropdown(null); }}
                      className="flex w-full text-right px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors items-center justify-end gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </button>
                  ))}
                </div>
              </DropdownButton>

              {/* 6. الطقس */}
              <div className="relative">
                <button
                  ref={weatherRef}
                  onClick={checkWeather}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 header-button border text-xs font-semibold ${
                    weatherCondition === 'hot'
                      ? 'bg-red-900/50 hover:bg-red-800/60 border-red-700/50 text-red-200 hover:text-red-100'
                      : weatherCondition === 'cold'
                      ? 'bg-blue-900/50 hover:bg-blue-800/60 border-blue-700/50 text-blue-200 hover:text-blue-100'
                      : weatherCondition === 'moderate'
                      ? 'bg-emerald-900/50 hover:bg-emerald-800/60 border-emerald-700/50 text-emerald-200 hover:text-emerald-100'
                      : 'bg-slate-700/50 hover:bg-slate-600/60 border-slate-600/50 text-slate-200 hover:text-slate-100'
                  }`}
                  title="حالة الطقس"
                >
                  {weatherLoading ? (
                    <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {weatherTemp !== null
                      ? `${weatherCondition === 'hot' ? '🔥' : weatherCondition === 'cold' ? '❄️' : '🌤️'} ${weatherTemp}°`
                      : 'الطقس'}
                  </span>
                  <span className="sm:hidden">
                    {weatherTemp !== null ? `${weatherTemp}°` : '🌤️'}
                  </span>
                </button>
                {(weatherCondition === 'hot' || weatherCondition === 'cold') && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-green-800 animate-pulse" />
                )}
              </div>

              {/* فاصل */}
              <div className="hidden sm:block w-px h-7 bg-green-600/40 mx-0.5" />

              {/* 7. أزرار الحضور والانصراف — الأقرب للمركز */}
              <AttendanceButtons />

            </div>

            {/* ===== وسط: الشعار ===== */}
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="flex items-center gap-2 bg-green-800/30 px-4 py-2 rounded-full border border-green-600/30">
                <span className="text-2xl">🐓</span>
                <div className="text-center">
                  <h1 className="text-lg sm:text-xl font-bold text-green-100 tracking-wide">
                    إدارة الدواجن
                  </h1>
                  {currentPage ? (
                    <p className="text-xs text-yellow-300 hidden sm:block font-medium">
                      {currentPage.icon} {currentPage.ar}
                    </p>
                  ) : (
                    <p className="text-xs text-green-300 hidden sm:block">Poultry Management</p>
                  )}
                </div>
                <span className="text-2xl">🐥</span>
              </div>
            </div>

            {/* ===== يمين: اسم المستخدم (فوق) + زر القائمة (تحته) ===== */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-shrink-0 items-end">

              {/* معلومات المستخدم */}
              

              {/* زر القائمة — دائماً ظاهر تحت الاسم */}
              <button
                onClick={toggleSidebar}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-200 group w-full justify-end ${
                  sidebarOpen
                    ? 'bg-green-700/60 border-green-500/60 text-green-50'
                    : 'bg-green-800/50 hover:bg-green-700/60 border-green-600/40 hover:border-green-500/60 text-green-200 hover:text-green-50'
                }`}
                aria-label="فتح/إغلاق القائمة"
              >
                <span className="text-xs font-medium transition-colors truncate">
                  {sidebarOpen ? 'إغلاق القائمة' : 'القائمة الرئيسية'}
                </span>
                <Menu className="w-4 h-4 transition-colors flex-shrink-0" />
              </button>
            </div>

          </div>

          {/* شريط ثانوي — شاشات صغيرة فقط */}
          <div className="flex items-center justify-between mt-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-green-800/50 text-green-100 rounded-full text-xs font-semibold border border-green-600/30 flex items-center gap-1">
                <span>🐔</span>
                <span>نظام نشط</span>
              </div>
              {weatherTemp && (
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                  weatherCondition === 'hot'  ? 'bg-red-800/50 text-red-100 border-red-600/30' :
                  weatherCondition === 'cold' ? 'bg-blue-800/50 text-blue-100 border-blue-600/30' :
                  'bg-green-800/50 text-green-100 border-green-600/30'
                }`}>
                  {weatherCondition === 'hot'      && '🔥'}
                  {weatherCondition === 'cold'     && '❄️'}
                  {weatherCondition === 'moderate' && '🌤️'}
                  {weatherTemp}°C
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* الدليل السريع */}
      {showQuickGuideModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-fadeIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-emerald-700 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      🐔 الدليل السريع للنظام
                    </h3>
                    <p className="text-green-100 text-sm mt-1">تعرف على النظام خطوة بخطوة</p>
                  </div>
                  <button
                    onClick={closeQuickGuideModal}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-green-200 mb-1.5">
                    <span>الخطوة {currentGuideStep + 1} من {quickGuideSteps.length}</span>
                    <span>{quickGuideSteps[currentGuideStep].duration || 'سريع'}</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-300"
                      style={{ width: `${((currentGuideStep + 1) / quickGuideSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center text-3xl">
                    {quickGuideSteps[currentGuideStep].icon}
                  </div>
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
                  {quickGuideSteps[currentGuideStep].title}
                </h4>
                
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
                  {quickGuideSteps[currentGuideStep].description}
                </p>
                
                <div className="mb-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    الميزات الرئيسية
                  </h5>
                  <div className="space-y-1.5">
                    {quickGuideSteps[currentGuideStep].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {currentGuideStep === quickGuideSteps.length - 1 && quickGuideSteps[currentGuideStep].tips && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      نصائح مهمة للبدء
                    </h5>
                    <div className="space-y-1.5">
                      {quickGuideSteps[currentGuideStep].tips.map((tip, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                          <span className="text-amber-800 dark:text-amber-300 text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={prevGuideStep}
                    disabled={currentGuideStep === 0}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                      currentGuideStep === 0
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700'
                    }`}
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                    السابق
                  </button>
                  
                  <div className="flex items-center gap-1.5">
                    {quickGuideSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToGuideStep(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          currentGuideStep === index
                            ? 'bg-green-500 w-4'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      ></button>
                    ))}
                  </div>
                  
                  <button
                    onClick={nextGuideStep}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {currentGuideStep === quickGuideSteps.length - 1 ? 'إنهاء 🐥' : 'التالي 🐔'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <button
                  onClick={closeQuickGuideModal}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {currentGuideStep === quickGuideSteps.length - 1 ? 'إغلاق الدليل' : 'تخطي الدليل'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* إشعار معلومات الدعم */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/50 overflow-hidden">

              {/* رأس مضغوط */}
              <div className="bg-gradient-to-r from-green-700 to-emerald-700 px-4 py-3 text-white flex justify-between items-center">
                <button onClick={closeSupportModal} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <h3 className="font-bold flex items-center gap-2 text-sm">
                  🐔 الدعم الفني
                  <Phone className="w-4 h-4" />
                </h3>
              </div>

              {/* جهات الاتصال — مضغوطة */}
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

              {/* زر الإغلاق */}
              <div className="px-3 pb-3">
                <button
                  onClick={closeSupportModal}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  إغلاق 🐓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال التقارير السريعة ===== */}
      {showReportModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg animate-slideIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-blue-800/50 overflow-hidden">

              {/* رأس المودال */}
              <div className={`p-4 text-white ${
                currentReport.period === 'production'
                  ? 'bg-gradient-to-r from-green-700 to-emerald-700'
                  : currentReport.period === 'today'
                  ? 'bg-gradient-to-r from-blue-700 to-cyan-600'
                  : currentReport.period === 'week'
                  ? 'bg-gradient-to-r from-violet-700 to-purple-600'
                  : 'bg-gradient-to-r from-orange-600 to-amber-500'
              }`}>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <h3 className="text-lg font-bold flex items-center gap-2 justify-end">
                      {currentReport.icon} {currentReport.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-0.5">
                      {currentReport.period === 'today'      && `بيانات ${new Date().toLocaleDateString('ar-SA')}`}
                      {currentReport.period === 'week'       && 'آخر 7 أيام'}
                      {currentReport.period === 'month'      && `${new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}`}
                      {currentReport.period === 'production' && 'إجمالي سجلات الإنتاج'}
                    </p>
                  </div>
                </div>
              </div>

              {/* محتوى المودال */}
              <div className="p-4 max-h-[62vh] overflow-y-auto" dir="rtl">
                {reportLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="text-4xl animate-bounce">
                      {currentReport.period === 'production' ? '🐔' : '📊'}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">جارٍ تحميل بيانات التقرير...</p>
                  </div>
                ) : !reportData ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p>تعذر تحميل التقرير</p>
                  </div>
                ) : currentReport.period !== 'production' ? (
                  /* تقارير اليوم / الأسبوع / الشهر */
                  <div className="space-y-3">
                    {/* طلبات الوقود */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⛽</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">طلبات الوقود</span>
                        <span className="mr-auto text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {reportData.data.fuelOrders.count}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الكمية</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            {reportData.data.fuelOrders.totalQuantity.toLocaleString('ar-SA')} <span className="text-xs font-normal">لتر</span>
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">تم التسليم</p>
                          <p className="font-bold text-green-700 dark:text-green-400">{reportData.data.fuelOrders.delivered}</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">قيد المعالجة</p>
                          <p className="font-bold text-yellow-700 dark:text-yellow-400">{reportData.data.fuelOrders.pending}</p>
                        </div>
                      </div>
                    </div>

                    {/* طلبات الغذاء */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🌾</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">طلبات المواد الغذائية</span>
                        <span className="mr-auto text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {reportData.data.foodOrders.count}
                        </span>
                      </div>
                      {reportData.data.foodOrders.count > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-7">
                          إجمالي الكمية: {reportData.data.foodOrders.totalQuantity.toLocaleString('ar-SA')} وحدة
                        </p>
                      )}
                    </div>

                    {/* الفحوصات الطبية */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🩺</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">الفحوصات الطبية</span>
                        <span className="mr-auto text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {reportData.data.medicalExams.count}
                        </span>
                      </div>
                      {reportData.data.medicalExams.count > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الطيور</p>
                            <p className="font-bold text-gray-800 dark:text-gray-100">
                              {reportData.data.medicalExams.totalChickens.toLocaleString('ar-SA')}
                            </p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي النفوق</p>
                            <p className="font-bold text-red-600 dark:text-red-400">
                              {reportData.data.medicalExams.totalMortality}
                            </p>
                          </div>
                        </div>
                      )}
                      {Object.keys(reportData.data.medicalExams.byStatus).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(reportData.data.medicalExams.byStatus).map(([status, count]) => (
                            <span key={status} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                              {status}: {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* بلاغات النظافة */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧹</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">بلاغات النظافة</span>
                        <span className="mr-auto text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {reportData.data.sanitationReports.count}
                        </span>
                      </div>
                      {reportData.data.sanitationReports.count > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-7">
                          متوسط تقييم النظافة: <strong className="text-purple-600 dark:text-purple-400">{reportData.data.sanitationReports.avgRating} / 10</strong>
                        </p>
                      )}
                    </div>

                    {/* إجمالي نشاط */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي النشاط خلال الفترة</p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {reportData.data.fuelOrders.count +
                         reportData.data.foodOrders.count +
                         reportData.data.medicalExams.count +
                         reportData.data.sanitationReports.count}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">إجمالي السجلات</p>
                    </div>
                  </div>
                ) : (
                  /* تقرير الإنتاج */
                  <div className="space-y-3">
                    {/* عمليات الفرز والتعبئة */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">📦</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">عمليات الفرز والتعبئة</span>
                        <span className="mr-auto text-2xl font-bold text-green-600 dark:text-green-400">
                          {reportData.data.packingOps.count}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الكمية</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            {reportData.data.packingOps.totalQuantity.toLocaleString('ar-SA')}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الوزن (كغ)</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            {reportData.data.packingOps.totalWeight.toLocaleString('ar-SA')}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">الدرجة A</p>
                          <p className="font-bold text-green-700 dark:text-green-400">
                            {reportData.data.packingOps.gradeA.toLocaleString('ar-SA')}
                          </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">المرفوضة</p>
                          <p className="font-bold text-red-600 dark:text-red-400">
                            {reportData.data.packingOps.rejected.toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      {Object.keys(reportData.data.packingOps.byStatus).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Object.entries(reportData.data.packingOps.byStatus).map(([s, c]) => (
                            <span key={s} className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
                              {s}: {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* استهلاك الوقود */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">⛽</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">سجلات استهلاك الوقود</span>
                        <span className="mr-auto text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {reportData.data.fuelConsumption.count}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الوقود</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            {reportData.data.fuelConsumption.totalFuel.toLocaleString('ar-SA')} <span className="text-xs font-normal">لتر</span>
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي التكلفة</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            {reportData.data.fuelConsumption.totalCost.toLocaleString('ar-SA')}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي المسافة</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            {reportData.data.fuelConsumption.totalKm.toLocaleString('ar-SA')} <span className="text-xs font-normal">كم</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* استهلاك الأعلاف */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🌾</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">سجلات استهلاك الأعلاف</span>
                        <span className="mr-auto text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {reportData.data.foodConsumption.count}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي اليومي (كغ)</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            {reportData.data.foodConsumption.totalDaily.toLocaleString('ar-SA')}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي التكلفة</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            {reportData.data.foodConsumption.totalCost.toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* تذييل المودال */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  إغلاق التقرير 🐔
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===== مودال الطقس ===== */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm animate-slideIn">
            <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border overflow-hidden ${(WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).border}`}>

              {/* رأس المودال */}
              <div className={`bg-gradient-to-r ${(WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).gradient} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={fetchWeatherData}
                    disabled={weatherLoading}
                    title="تحديث البيانات"
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50 text-base"
                  >
                    🔄
                  </button>
                  <div className="text-right">
                    <h3 className="text-lg font-bold flex items-center justify-end gap-2">
                      {(WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).icon} حالة الطقس
                    </h3>
                    <p className="text-white/80 text-sm mt-0.5">
                      {(WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).label}
                      {weatherTemp !== null && ` — ${weatherTemp}°C`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWeatherModal(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* محتوى المودال */}
              {weatherLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="text-4xl animate-bounce">🌡️</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">جارٍ جلب بيانات الطقس...</p>
                </div>
              ) : weatherTemp === null ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="text-4xl">⚠️</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">تعذر جلب البيانات</p>
                  <button onClick={fetchWeatherData} className="mt-2 text-sm text-blue-500 hover:underline">
                    إعادة المحاولة
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-2.5" dir="rtl">
                  {[
                    { label: 'درجة الحرارة', value: `${weatherTemp}°C`,               icon: '🌡️' },
                    { label: 'سرعة الرياح',  value: `${weatherData?.speed ?? '—'} كم/س`, icon: '💨' },
                    { label: 'اتجاه الرياح', value: `${weatherData?.direction ?? '—'}°`,  icon: '🧭' },
                    { label: 'الحالة العامة', value: (WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).label, icon: (WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).icon },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between rounded-xl px-4 py-2.5 border bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{value}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{icon} {label}</span>
                    </div>
                  ))}

                  <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${(WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).tipClass}`}>
                    💡 {(WEATHER_STYLES[weatherCondition] || WEATHER_STYLES.normal).tip}
                  </div>
                </div>
              )}

              {/* تذييل */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowWeatherModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  إغلاق 🌤️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال إعدادات التنبيهات ===== */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-slideIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-800/50 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-700 to-violet-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <button onClick={() => setShowNotifModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">🔔 إعدادات التنبيهات</h3>
                    <p className="text-purple-100 text-sm mt-0.5">تحكم بأنواع التنبيهات التي تتلقاها</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3" dir="rtl">
                {NOTIF_ITEMS.map(({ key, label, desc, icon, card }) => (
                  <div key={key} className={`flex items-center justify-between p-3 rounded-xl border ${card}`}>
                    <button
                      onClick={() => toggleNotif(key)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${notifSettings[key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifSettings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{icon} {label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => { setShowNotifModal(false); toast.success('✅ تم حفظ إعدادات التنبيهات'); }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  حفظ الإعدادات ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال خصوصية البيانات ===== */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-slideIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <button onClick={() => setShowPrivacyModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">🛡️ خصوصية البيانات</h3>
                    <p className="text-blue-100 text-sm mt-0.5">سياسات حماية بيانات المزرعة</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto" dir="rtl">
                {PRIVACY_ITEMS.map(({ icon, title, desc, card }) => (
                  <div key={title} className={`flex items-start gap-3 p-3 rounded-xl border ${card}`}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  فهمت 🛡️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال النسخة الاحتياطية ===== */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-slideIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-700 to-teal-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <button onClick={() => setShowBackupModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">💾 النسخة الاحتياطية</h3>
                    <p className="text-green-100 text-sm mt-0.5">تصدير واستيراد بيانات المزرعة</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3" dir="rtl">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span>ℹ️</span>
                    آخر نسخة احتياطية: {localStorage.getItem('lastBackupDate') || 'لم يتم إنشاء نسخة بعد'}
                  </p>
                </div>
                <button
                  onClick={() => { handleExportData(); setShowBackupModal(false); }}
                  className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <span className="text-xs text-green-600 dark:text-green-400">تنزيل ملف JSON</span>
                  <span className="font-semibold text-green-800 dark:text-green-200 text-sm">📥 تصدير البيانات</span>
                </button>
                <button
                  onClick={() => { handleImportData(); setShowBackupModal(false); }}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <span className="text-xs text-amber-600 dark:text-amber-400">رفع ملف JSON أو CSV</span>
                  <span className="font-semibold text-amber-800 dark:text-amber-200 text-sm">📤 استيراد البيانات</span>
                </button>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  إغلاق 💾
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال معلومات النظام ===== */}
      {showSysInfoModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md animate-slideIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-gray-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <button onClick={() => setShowSysInfoModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">ℹ️ معلومات النظام</h3>
                    <p className="text-gray-200 text-sm mt-0.5">بيانات النظام والمزرعة</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2.5" dir="rtl">
                {[
                  { label: 'اسم المزرعة',     value: 'مزرعة الدواجن السعيدة',              icon: '🏡' },
                  { label: 'الموقع',           value: 'دمشق، الجمهورية العربية السورية',   icon: '📍' },
                  { label: 'إصدار النظام',     value: 'v2.1.0',                             icon: '🔧' },
                  { label: 'تاريخ الإنشاء',    value: '2024',                               icon: '📅' },
                  { label: 'المستخدم الحالي', value: user?.name || 'غير معروف',             icon: '👤' },
                  { label: 'الصلاحية',         value: user?.role === 'admin'    ? 'أدمن النظام'
                                                     : user?.role === 'manager'  ? 'مدير المنشأة'
                                                     : user?.role === 'employee' ? 'موظف'
                                                     : user?.role || '—',                   icon: '🛡️' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl px-4 py-2.5 border bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{value}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{icon} {label}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setShowSysInfoModal(false)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    if (user?.role === 'admin') {
                      setShowSysInfoModal(false);
                      navigate('/settings');
                    } else {
                      toast.error('🔒 ليس لديك صلاحية الوصول إلى إعدادات النظام — هذه الصفحة مخصصة للمدير فقط');
                    }
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  الإعدادات الكاملة ⚙️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* إشعار الأسئلة الشائعة */}
      {showFAQModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/50 overflow-hidden max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-700 to-emerald-700 p-6 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <HelpIcon className="w-6 h-6" />
                      🐔 الأسئلة الشائعة
                    </h3>
                    <p className="text-green-100 mt-1">إجابات على أكثر الأسئلة شيوعاً حول النظام</p>
                  </div>
                  <button
                    onClick={closeFAQModal}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    استخدام النظام
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 transition-colors">
                      <button
                        onClick={() => toggleFAQItem(0)}
                        className="w-full flex justify-between items-center p-4 text-right"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">🐔 كيف يمكنني إضافة مستخدم جديد للنظام؟</span>
                        <ChevronRight className={`w-5 h-5 text-green-500 transition-transform ${openFAQItems.includes(0) ? 'rotate-90' : ''}`} />
                      </button>
                      {openFAQItems.includes(0) && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            انتقل إلى صفحة "المستخدمين" من القائمة الجانبية، ثم انقر على زر "إضافة مستخدم جديد". 
                            قم بملء المعلومات المطلوبة (الاسم، البريد الإلكتروني، الصلاحية) ثم احفظ التغييرات.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 transition-colors">
                      <button
                        onClick={() => toggleFAQItem(1)}
                        className="w-full flex justify-between items-center p-4 text-right"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">🥚 كيف يمكنني إنشاء تقرير إنتاج؟</span>
                        <ChevronRight className={`w-5 h-5 text-green-500 transition-transform ${openFAQItems.includes(1) ? 'rotate-90' : ''}`} />
                      </button>
                      {openFAQItems.includes(1) && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            انتقل إلى صفحة "الإنتاج" ثم اختر الفترة الزمنية المطلوبة (يومي، أسبوعي، شهري). 
                            يمكنك تصدير التقرير بصيغة PDF أو Excel من خلال الأزرار الموجودة أعلى التقرير.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    المشاكل التقنية
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-colors">
                      <button
                        onClick={() => toggleFAQItem(3)}
                        className="w-full flex justify-between items-center p-4 text-right"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">⚠️ لماذا لا تظهر البيانات بشكل صحيح؟</span>
                        <ChevronRight className={`w-5 h-5 text-blue-500 transition-transform ${openFAQItems.includes(3) ? 'rotate-90' : ''}`} />
                      </button>
                      {openFAQItems.includes(3) && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            1. تأكد من اتصال الإنترنت.<br/>
                            2. جرب تحديث الصفحة (F5).<br/>
                            3. تحقق من صلاحيات المستخدم.<br/>
                            4. إذا استمرت المشكلة، اتصل بالدعم الفني.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <p className="text-sm text-green-800 dark:text-green-300 text-center">
                    🐔 لم تجد إجابتك؟ يمكنك دائماً <button onClick={openSupportModal} className="font-bold underline hover:opacity-80">الاتصال بالدعم الفني</button>
                  </p>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={closeFAQModal}
                  className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-300 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  فهمت، شكراً لك 🐥
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
