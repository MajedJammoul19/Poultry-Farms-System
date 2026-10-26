import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { checkIn } from '../api/attendance';
import useAuth from '../hooks/use-auth';

const toTime = (date) =>
  date ? new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';

const EmployeeCheckInGate = ({ children }) => {
  const { user, attendanceStatus, attendanceLoading, refreshAttendanceStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // غير موظف → لا بوابة
  if (!user || user.role !== 'employee') return <>{children}</>;

  // جاري تحميل حالة الحضور من السيرفر
  if (attendanceLoading) {
    return (
      <div className="min-h-screen bg-[#f0f9f0] dark:bg-[#0a1a0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🐔</div>
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-green-700 dark:text-green-300 font-medium text-sm">جاري التحقق من حالة حضورك...</p>
        </div>
      </div>
    );
  }

  // الموظف سجّل حضوره في هذه الجلسة → أكمل بشكل طبيعي
  if (attendanceStatus && attendanceStatus.status === 'checked-in') return <>{children}</>;

  // ===== بوابة الحضور =====
  // تظهر في كل حالة أخرى:
  //   - لا يوجد حضور (أول دخول)
  //   - سجّل انصراف ثم دخل مجدداً (جلسة جديدة)

  const previousSession = attendanceStatus && attendanceStatus.status === 'checked-out';

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const result = await checkIn();
      if (result.success) {
        const t = toTime(result.data?.checkInTime);
        toast.success(
          <div dir="rtl" style={{ lineHeight: '1.6' }}>
            <p style={{ fontWeight: '700', fontSize: '0.93em', marginBottom: '2px' }}>
              ✅ تم تسجيل الحضور بنجاح 🐔
            </p>
            {t && (
              <p style={{ fontSize: '0.78em', opacity: 0.75 }}>
                🕐 وقت الحضور:&nbsp;<strong>{t}</strong>
              </p>
            )}
          </div>,
          { duration: 3500 }
        );
        await refreshAttendanceStatus();
      } else {
        toast.error(result.message || 'فشل في تسجيل الحضور');
      }
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء تسجيل الحضور');
    } finally {
      setLoading(false);
    }
  };

  const handleRefuse = () => {
    signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-[#0a1a0f] dark:via-[#0d1f17] dark:to-[#0a1a14] flex items-center justify-center p-4">
      {/* نقاط الخلفية */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #16a34a 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        aria-hidden="true"
      />
      {/* هالات ضوئية */}
      <div className="absolute top-[-10%] right-[-8%] w-[min(50vw,480px)] aspect-square rounded-full opacity-20 dark:opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)', filter: 'blur(60px)' }} aria-hidden="true" />
      <div className="absolute bottom-[-8%] left-[-6%] w-[min(44vw,400px)] aspect-square rounded-full opacity-15 dark:opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)', filter: 'blur(70px)' }} aria-hidden="true" />

      <div className="relative bg-white/90 dark:bg-[#0f1f17]/92 backdrop-blur-xl rounded-3xl shadow-2xl shadow-green-900/10 dark:shadow-green-900/40 border border-white/60 dark:border-green-800/20 p-8 max-w-md w-full text-center">

        {/* شعار */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-lg shadow-green-600/30">
          🐔
        </div>

        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
          مرحباً، {user.name}
        </h2>
        <p className="text-sm text-green-600 dark:text-green-400 mb-5">نظام إدارة الدواجن</p>

        {/* إشعار جلسة سابقة */}
        {previousSession && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl p-3 mb-4 text-right">
            <p className="text-blue-700 dark:text-blue-300 text-xs font-semibold mb-0.5">📋 جلسة سابقة اليوم</p>
            <p className="text-blue-600 dark:text-blue-400 text-xs">
              {toTime(attendanceStatus.checkInTime)} ← {toTime(attendanceStatus.checkOutTime)}
            </p>
          </div>
        )}

        <div className="h-px bg-green-100 dark:bg-green-800/30 mb-5" />

        {/* رسالة التنبيه */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 mb-6 text-right">
          <p className="text-amber-800 dark:text-amber-300 font-bold text-sm mb-1">⚠️ تسجيل الحضور مطلوب</p>
          <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
            {previousSession
              ? 'لتبدأ جلسة عمل جديدة يجب تسجيل حضورك مجدداً.'
              : 'لا يمكنك استخدام النظام قبل تسجيل حضورك.'}
          </p>
        </div>

        {/* أزرار */}
        <div className="space-y-3">
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 hover:shadow-green-600/40"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {previousSession ? 'تسجيل حضور جلسة جديدة' : 'تسجيل الحضور والدخول للنظام'}
              </>
            )}
          </button>

          <button
            onClick={handleRefuse}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-300 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            رفض والخروج من الحساب
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-5">© 2026 — نظام إدارة الدواجن</p>
      </div>
    </div>
  );
};

export default EmployeeCheckInGate;
