import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { checkIn, checkOut } from '../api/attendance';
import useAuth from '../hooks/use-auth';

const toTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '';

const AttendanceButtons = () => {
  const { user, attendanceStatus, refreshAttendanceStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingCheckOut, setConfirmingCheckOut] = useState(false);

  const formatHours = (totalHours) => {
    if (totalHours == null || totalHours <= 0) return '';
    const totalSeconds = Math.round(totalHours * 3600);
    const hours   = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours === 0 && minutes === 0) return `${seconds} ثانية`;
    if (hours === 0) return seconds > 0 ? `${minutes} دقيقة و ${seconds} ثانية` : `${minutes} دقيقة`;
    if (minutes === 0) return `${hours} ساعة`;
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
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
              <p style={{ fontSize: '0.78em', opacity: 0.72 }}>
                🕐 وقت الحضور:&nbsp;<strong>{t}</strong>
              </p>
            )}
          </div>,
          { duration: 4000 }
        );
        refreshAttendanceStatus();
      } else {
        setError(result.message || 'فشل في تسجيل الحضور');
        toast.error(`🐓 ${result.message || 'فشل في تسجيل الحضور'}`);
      }
    } catch (err) {
      const msg = err.message || 'حدث خطأ أثناء تسجيل الحضور';
      setError(msg);
      toast.error(`🐓 ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    // لا نُخفي واجهة التأكيد حتى تنتهي العملية
    try {
      const result = await checkOut();
      if (result.success) {
        const duration  = formatHours(result.data.totalHours);
        const checkInT  = toTime(result.data.checkInTime);
        const checkOutT = toTime(result.data.checkOutTime);
        toast.success(
          <div dir="rtl" style={{ lineHeight: '1.6' }}>
            <p style={{ fontWeight: '700', fontSize: '0.93em', marginBottom: '4px' }}>
              👋 تم تسجيل الانصراف بنجاح 🐔
            </p>
            {duration && (
              <p style={{ fontSize: '0.82em', fontWeight: '600', color: '#16a34a', marginBottom: '2px' }}>
                ⏱️ مدة الجلسة:&nbsp;{duration}
              </p>
            )}
            {checkInT && checkOutT && (
              <p style={{ fontSize: '0.76em', opacity: 0.68 }}>
                🕐 {checkInT}&nbsp;←&nbsp;🕓 {checkOutT}
              </p>
            )}
          </div>,
          { duration: 4000 }
        );
        // خروج فوري بدون تأخير
        signOut();
        navigate('/sign-in', { replace: true });
      } else {
        setConfirmingCheckOut(false);
        setError(result.message || 'فشل في تسجيل الانصراف');
        toast.error(`🐓 ${result.message || 'فشل في تسجيل الانصراف'}`);
      }
    } catch (err) {
      setConfirmingCheckOut(false);
      const msg = err.message || 'حدث خطأ أثناء تسجيل الانصراف';
      setError(msg);
      toast.error(`🐓 ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => toTime(date) || '--:--';

  if (!user || user.role !== 'employee') return null;

  const hasAttendance = !!attendanceStatus;
  const status        = attendanceStatus?.status ?? null;
  const checkInTime   = attendanceStatus?.checkInTime ?? null;
  const totalHours    = attendanceStatus?.totalHours ?? null;

  const Spinner = () => (
    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  return (
    <div className="flex items-center gap-2" dir="rtl">

      {/* رسالة خطأ */}
      {error && (
        <span className="text-red-300 text-xs bg-red-900/30 border border-red-700/30 px-2 py-1 rounded-lg">
          {error}
        </span>
      )}

      {/* ===== زر تسجيل الحضور ===== */}
      {!hasAttendance && (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-700/50 hover:bg-green-600/60 border border-green-500/40 hover:border-green-400/50 text-green-100 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Spinner /> : (
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          تسجيل الحضور
        </button>
      )}

      {/* ===== حالة checked-in: زر الانصراف + وقت الحضور ===== */}
      {hasAttendance && status === 'checked-in' && (
        <>
          {confirmingCheckOut ? (
            /* واجهة التأكيد */
            <div className="flex items-center gap-1.5 bg-green-900/50 border border-green-700/40 rounded-xl px-2.5 py-1.5" dir="rtl">
              <span className="text-xs text-green-200/80 whitespace-nowrap hidden sm:inline">تأكيد الانصراف؟</span>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 bg-amber-800/60 hover:bg-amber-700/70 border border-amber-600/40 text-amber-100 text-xs rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Spinner /> : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                تأكيد
              </button>
              <button
                onClick={() => setConfirmingCheckOut(false)}
                className="px-2 py-1 bg-green-800/60 hover:bg-green-700/60 border border-green-600/30 text-green-300 hover:text-green-200 text-xs rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <>
              {/* وقت الحضور */}
              {checkInTime && (
                <div className="hidden sm:flex items-center gap-1 text-xs text-green-300/70 bg-green-900/30 border border-green-700/25 px-2 py-1 rounded-lg">
                  <span>🕐</span>
                  <span>{formatTime(checkInTime)}</span>
                </div>
              )}
              {/* زر الانصراف */}
              <button
                onClick={() => setConfirmingCheckOut(true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-900/40 hover:bg-amber-800/55 border border-amber-700/35 hover:border-amber-600/50 text-amber-200 hover:text-amber-100 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                تسجيل الانصراف
              </button>
            </>
          )}
        </>
      )}

      {/* ===== حالة checked-out (نادراً تُرى لأن الخروج يكون فورياً) ===== */}
      {hasAttendance && status === 'checked-out' && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-900/40 border border-green-700/30 text-green-300/70 rounded-xl text-xs">
          <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>تم تسجيل اليوم</span>
          {totalHours != null && totalHours > 0 && (
            <span className="bg-green-800/50 border border-green-600/30 px-1.5 py-0.5 rounded-md text-green-300">
              {formatHours(totalHours)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceButtons;
