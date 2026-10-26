import React, { useEffect, useRef, useState, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import useAuth from '../hooks/use-auth';
import { useSidebar } from '../context/SidebarContext';
import { AuthContext } from '../context/auth-context';
const MENU_ITEMS = [
  // ─── لوحة التحكم ────────────────────────────────────────────
  { nameAr: 'لوحة التحكم', nameEn: 'Dashboard', path: '/dashbourd', roles: ['admin', 'manager', 'employee'] },

  // ─── أدمن النظام فقط ─────────────────────────────────────────
  { nameAr: 'إدارة المستخدمين', nameEn: 'User Management',  path: '/employee',      roles: ['admin'] },
  { nameAr: 'سجلات الأنشطة',    nameEn: 'Activity Logs',    path: '/activity-logs', roles: ['admin', 'manager'] },
  { nameAr: 'إعدادات النظام',   nameEn: 'System Settings',  path: '/settings',      roles: ['admin'] },

  // ─── مدير المنشأة — الإنتاج والعمليات ───────────────────────
  { nameAr: 'تخطيط الموارد',          nameEn: 'Resource Planning',    path: '/resource-planning',   roles: ['manager', 'employee'] },
  { nameAr: 'فرز وتعبئة',             nameEn: 'Packing Operations',   path: '/packing-operations',  roles: ['manager', 'employee'] },
  { nameAr: 'تقارير الفرز',           nameEn: 'Packing Reports',      path: '/packing-reports',     roles: ['manager', 'employee'] },
  { nameAr: 'سجلات الإنتاج',          nameEn: 'Productivity Records', path: '/productivity-reports', roles: ['manager'] },
  { nameAr: 'تسجيل البيانات اليومية', nameEn: 'Daily Data Entry',     path: '/daily-data',           roles: ['manager', 'employee'] },

  // ─── الصحة والبيطرة ──────────────────────────────────────────
  { nameAr: 'الفحوصات البيطرية',         nameEn: 'Health Checks',      path: '/health-checks',      roles: ['vet'] },
    { nameAr: 'تقارير الموت',         nameEn: 'Mortality Reports',      path: '/mortality-reports',      roles: ['vet'] },
  { nameAr: 'خطط التغذية',              nameEn: 'Feeding Plans',       path: '/feeding-plans',      roles: ['vet'] },
  { nameAr: 'تقارير الفحوصات البيطرية', nameEn: 'Health Reports',     path: '/health-reports',     roles: ['vet', 'employee', 'manager'] },
  { nameAr: 'خطط الوقاية',             nameEn: 'Prevention Plans',    path: '/prevention-plans',   roles: ['vet'] },
  { nameAr: 'طلب أدوية',               nameEn: 'Medicine Requests',   path: '/medication-requests', roles: ['vet', 'manager'] },
  { nameAr: 'تقارير خطط الوقاية',      nameEn: 'Prevention Reports', path: '/prevention-reports', roles: ['vet', 'employee', 'manager'] },

  // ─── تاجر المواد الغذائية ────────────────────────────────────
  { nameAr: 'التغذية اليومية',        nameEn: 'Daily Feeding',              path: '/daily-feeding',            roles: ['food_supplier', 'manager'] },
  { nameAr: 'التغذية العامة',         nameEn: 'General Feeding',            path: '/general-feeding',          roles: ['food_supplier', 'manager'] },
  { nameAr: 'تقارير التغذية العامة', nameEn: 'General Feeding Reports',    path: '/general-feeding-reports',  roles: ['food_supplier'] },
  { nameAr: 'المعلومات الشخصية ',        nameEn: 'personal information',       path: '/food-supplier-profile',    roles: ['food_supplier'] },

  // ─── الحضور والانصراف ────────────────────────────────────────
  { nameAr: 'سجل الحضور والانصراف', nameEn: 'Attendance History', path: '/attendance-history', roles: ['employee', 'admin'] },
      { nameAr: 'سجل المهام', nameEn: 'Todo Tasks', path: '/todo-tasks', roles: ['employee'] },

  // ─── النظافة والصحة العامة ───────────────────────────────────
  { nameAr: 'بلاغات النظافة',         nameEn: 'Hygiene Reports',      path: '/hygiene-reports', roles: ['employee'] },
  { nameAr: 'تقارير بلاغات النظافة', nameEn: 'Hygiene Documentation', path: '/hygiene-docs',    roles: ['employee', 'manager'] },

  // ─── الطلبات والإمدادات (مدير المنشأة) ───────────────────────
  { nameAr: 'مواعيد تجار الوقود', nameEn: 'Fuel Suppliers Availability', path: '/fuel-suppliers-availability', roles: ['admin', 'manager'] },
  { nameAr: 'طلب وقود',           nameEn: 'Fuel Request',                 path: '/fuel',                        roles: ['fuel_supplier', 'manager'] },
  { nameAr: 'طلب مواد غذائية',   nameEn: 'Food Request',                 path: '/food',                        roles: ['food_supplier', 'manager'] },

  // ─── الأسعار والمالية ────────────────────────────────────────
  { nameAr: 'عروض الأسعار',           nameEn: 'Pricing',         path: '/pricing',       roles: ['employee', 'food_supplier'] },
  { nameAr: 'سجل الأسعار التاريخي',   nameEn: 'Price History',   path: '/price-history', roles: ['food_supplier'] },

  // ─── إدارة الوقود (تاجر الوقود) ──────────────────────────────
  { nameAr: 'سجلات طلبات الوقود',    nameEn: 'Fuel Request Logs',     path: '/fuel-reports',              roles: ['fuel_supplier', 'employee', 'manager'] },
  { nameAr: 'استبيان استهلاك الوقود', nameEn: 'Fuel Consumption',     path: '/fuel-consumption',          roles: ['fuel_supplier'] },
  { nameAr: 'تقارير استهلاك الوقود', nameEn: 'Fuel Reports',          path: '/fuel-consumption-reports',  roles: ['fuel_supplier'] },
  { nameAr: 'الفواتير والمالية',      nameEn: 'Invoices & Finance',    path: '/fuel-invoices',             roles: ['fuel_supplier'] },
  { nameAr: 'إعدادات التوريد',        nameEn: 'Supply Settings',       path: '/fuel-supplier-settings',    roles: ['fuel_supplier'] },
  { nameAr: 'المعلومات الشخصية ',        nameEn: 'personal information',       path: '/fuel-supplier-profile',    roles: ['fuel_supplier'] },

];

/* ==================================
   Access Helper
================================== */

const hasAccess = (allowedRoles, userRole, authOnly) => {
  if (authOnly && userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};

/* ==================================
   Sidebar Drawer Component
================================== */

const Sidebar = () => {
  const { userRole } = useAuth();
  const { signOut } = useContext(AuthContext);
  const { isOpen, close } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // إغلاق الـ Drawer عند الانتقال بين الصفحات + إعادة تعيين تأكيد الخروج
  useEffect(() => {
    close();
    setConfirmLogout(false);
  }, [location.pathname]);

  // منع تمرير الصفحة عند فتح القائمة
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // إغلاق بمفتاح Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  // حفظ موضع التمرير
  useEffect(() => {
    const saved = sessionStorage.getItem('sidebarScrollPosition');
    if (saved && sidebarRef.current) {
      sidebarRef.current.scrollTop = parseInt(saved, 10);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        sessionStorage.setItem('sidebarScrollPosition', sidebarRef.current.scrollTop);
      }
    };
    const el = sidebarRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const filteredMenuItems = MENU_ITEMS.filter(({ roles, authOnly }) =>
    hasAccess(roles, userRole, authOnly)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-72 z-50 flex flex-col
          bg-gradient-to-b from-green-900 via-green-800 to-green-900
          text-white  border-l-4 border-green-600 overflow-y-auto
          transform transition-transform duration-300 ease-in-out 
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="القائمة الجانبية"
      >
        {/* رأس الـ Drawer */}
        <div className="sticky top-0 z-10 p-5 border-b border-green-700/40 bg-gradient-to-b from-green-900 to-green-800 flex items-center justify-between gap-3">
          <button
            onClick={close}
            className="flex-shrink-0 p-2 hover:bg-white/15 rounded-xl transition-colors text-green-200 hover:text-white"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-right min-w-0">
            <h2 className="text-lg font-bold tracking-wide text-green-100 leading-tight">
              إدارة الدواجن 🐔
            </h2>
            <p className="text-xs text-green-300/80 mt-0.5">Poultry Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1.5">
            {filteredMenuItems.map(({ nameAr, nameEn, path }) => (
              <li key={path}>
                <NavLink 
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative
                    ${isActive
                      ? 'bg-white/20 backdrop-blur-md shadow-lg text-white border-l-4 border-yellow-400'
                      : 'hover:bg-white/10 text-green-50 hover:text-white'
                    }`
                  }
                >
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-sm leading-tight">{nameAr}</div>
                    <div className="text-xs opacity-55 leading-tight mt-0.5">{nameEn}</div>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout — الموظف يخرج عبر تسجيل الانصراف فقط، لا زر خروج مباشر */}
        {userRole !== 'employee' && (
          <div className="sticky bottom-0 p-4 border-t border-green-700/40 bg-gradient-to-b from-green-800/60 to-green-900">
            {!confirmLogout ? (
              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 hover:border-red-500/70 text-red-300 hover:text-red-100 transition-all duration-200 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-green-200 text-xs">هل أنت متأكد من تسجيل الخروج؟</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmLogout(false)}
                    className="flex-1 py-2.5 rounded-xl bg-green-800/60 hover:bg-green-700/70 border border-green-600/40 text-green-200 text-xs font-medium transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => { signOut(); close(); navigate('/sign-in'); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-700/70 hover:bg-red-600/80 border border-red-500/50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    تأكيد الخروج
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-green-500/50 text-center mt-3">© 2026 Poultry Farm System</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
