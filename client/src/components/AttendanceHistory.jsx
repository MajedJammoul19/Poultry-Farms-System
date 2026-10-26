import React, { useEffect, useState } from 'react';
import { getAttendanceHistory, getAllAttendanceHistory } from '../api/attendance';
import useAuth from '../hooks/use-auth';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (totalHours) => {
  if (totalHours == null || totalHours <= 0) return '—';
  const totalSeconds = Math.round(totalHours * 3600);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours === 0 && minutes === 0) return `${seconds} ثانية`;
  if (hours === 0) return seconds > 0 ? `${minutes} دقيقة و ${seconds} ثانية` : `${minutes} دقيقة`;
  if (minutes === 0) return `${hours} ساعة`;
  return `${hours} ساعة و ${minutes} دقيقة`;
};

const StatCard = ({ label, value, icon, borderColor }) => (
  <div className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border-r-4 ${borderColor}`}>
    <span className="text-3xl">{icon}</span>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AttendanceHistory = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = isAdmin
          ? await getAllAttendanceHistory(1, 100)
          : await getAttendanceHistory(1, 100);
        if (result.success) {
          setRecords(result.data);
          setStats(result.stats);
        } else {
          setError('فشل في جلب سجل الحضور');
        }
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <svg className="animate-spin h-8 w-8 ml-3 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        جاري التحميل...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <span className="text-xl ml-2">⚠️</span> {error}
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-l from-green-700 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📋</span>
          <div>
            <h1 className="text-2xl font-bold">سجل الحضور والانصراف</h1>
            <p className="text-green-100 text-sm mt-1">جميع جلسات الحضور المسجَّلة</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="إجمالي الجلسات"
            value={stats.totalDaysPresent}
            icon="📅"
            borderColor="border-green-500"
          />
          <StatCard
            label="إجمالي ساعات العمل"
            value={`${stats.totalHoursWorked} ساعة`}
            icon="⏱️"
            borderColor="border-emerald-500"
          />
          <StatCard
            label="متوسط ساعات الجلسة"
            value={`${stats.averageHoursPerDay} ساعة`}
            icon="📊"
            borderColor="border-teal-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            سجلات الحضور ({records.length})
          </h2>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🗓️</span>
            لا توجد سجلات حضور بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">#</th>
                  {isAdmin && (
                    <th className="px-4 py-3 font-semibold border-b border-gray-200">الموظف</th>
                  )}
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">التاريخ</th>
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">وقت الحضور</th>
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">وقت الانصراف</th>
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">المدة</th>
                  <th className="px-4 py-3 font-semibold border-b border-gray-200">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {records.map((record, idx) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {record.userId?.name || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3 text-green-700 font-semibold">
                      🕐 {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">
                      {record.checkOutTime ? `🕓 ${formatTime(record.checkOutTime)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDuration(record.totalHours)}
                    </td>
                    <td className="px-4 py-3">
                      {record.status === 'checked-out' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          ✅ مكتمل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          🟡 في الدوام
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
