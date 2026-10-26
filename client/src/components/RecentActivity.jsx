import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { getRecentLogins } from '../api/auth';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expanded, setExpanded] = useState(false);
  const [fullActivities, setFullActivities] = useState([]);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullError, setFullError] = useState('');

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'الآن';
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `منذ ${seconds} ثانية`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const getRoleEmoji = (role) => {
    switch(role) {
      case 'admin': return '👨‍💼';
      case 'manager': return '👨‍🌾';
      case 'vet': return '🩺';
      case 'employee': return '👤';
      case 'food_supplier': return '🍽️';
      case 'fuel_supplier': return '⛽';
      default: return '👤';
    }
  };

  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'مدير النظام';
      case 'manager': return 'مدير المزرعة';
      case 'vet': return 'طبيب بيطري';
      case 'employee': return 'موظف';
      case 'food_supplier': return 'مورد مواد غذائية';
      case 'fuel_supplier': return 'مورد وقود';
      default: return 'مستخدم';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'from-red-400 to-red-600';
      case 'manager': return 'from-blue-400 to-blue-600';
      case 'vet': return 'from-green-400 to-green-600';
      case 'employee': return 'from-gray-400 to-gray-600';
      case 'food_supplier': return 'from-yellow-400 to-yellow-600';
      case 'fuel_supplier': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const mapLogins = (logins) => logins.map((login) => {
    const loginTimestamp = new Date(login.lastLogin).getTime();
    return {
      id: login.id,
      user: login.name,
      role: login.role,
      roleText: getRoleText(login.role),
      roleColor: getRoleColor(login.role),
      roleEmoji: getRoleEmoji(login.role),
      action: `تسجيل دخول`,
      time: getRelativeTime(loginTimestamp),
      timestamp: loginTimestamp,
      formattedTime: new Date(login.lastLogin).toLocaleString('ar-EG', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    };
  });

  useEffect(() => {
    const loadRecentLogins = async () => {
      setLoading(true);
      setError('');

      try {
        const recentLogins = await getRecentLogins(10);
        setActivities(mapLogins(recentLogins));
      } catch (err) {
        setError(err.message || 'حدث خطأ في جلب البيانات');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentLogins();
  }, []);

  const toggleFullLog = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (fullActivities.length === 0) {
      setFullLoading(true);
      setFullError('');

      try {
        const allLogins = await getRecentLogins(1000);
        setFullActivities(mapLogins(allLogins));
      } catch (err) {
        setFullError(err.message || 'حدث خطأ في جلب سجل تسجيلات الدخول');
        setFullActivities([]);
      } finally {
        setFullLoading(false);
      }
    }
  };

  const displayedActivities = expanded ? fullActivities : activities;

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => prev.map(activity => ({
        ...activity,
        time: getRelativeTime(activity.timestamp)
      })));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 h-full border border-white/50 flex items-center justify-center">
        <div className="text-gray-700">جارٍ تحميل أحدث تسجيلات الدخول...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 h-full border border-white/50">
        <div className="text-rose-600 font-semibold mb-3">حدث خطأ</div>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 h-full border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-gray-800">آخر المستخدمين الذين سجلوا دخولهم</h2>
          </div>
          <span className="text-2xl">🕐</span>
        </div>
        <div className="text-center py-12">
          <span className="text-6xl mb-3 block">📭</span>
          <p className="text-gray-500">لا توجد تسجيلات دخول سابقة</p>
          <p className="text-sm text-gray-400 mt-2">سيظهر هنا تاريخ تسجيلات دخول المستخدمين</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-white/30 bg-gradient-to-r from-green-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-gray-800">آخر المستخدمين الذين سجلوا دخولهم</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕐</span>
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full">
              {displayedActivities.length} نشاط
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 mr-8">
          {expanded ? 'سجل تسجيلات الدخول الكامل إلى النظام' : 'أحدث نشاطات تسجيل الدخول إلى النظام'}
        </p>
      </div>

      {expanded && fullLoading && (
        <div className="p-8 text-center text-gray-600">جارٍ تحميل سجل تسجيلات الدخول...</div>
      )}

      {expanded && !fullLoading && fullError && (
        <div className="p-8 text-center text-rose-600">{fullError}</div>
      )}

      {(!expanded || (!fullLoading && !fullError)) && (
      <div className={`flex-1 p-4 space-y-3 ${expanded ? '' : 'overflow-y-auto max-h-[400px]'}`}>
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className="group relative overflow-hidden bg-white/50 rounded-xl p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-lg cursor-pointer border border-white/30 hover:border-green-200"
            onMouseEnter={() => setHoveredId(activity.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-start gap-3">
              <div className={`relative bg-gradient-to-br ${activity.roleColor} p-2.5 rounded-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                <span className="text-2xl">{activity.roleEmoji}</span>
                {hoveredId === activity.id && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-md"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 text-base">{activity.user}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200">
                      {activity.roleText}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
                      <span className="text-sm">🕒</span>
                      <span>{activity.formattedTime}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">{activity.time}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm text-gray-500">🔐</span>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span>💻</span>
                    <span>متصفح ويب</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    <span>الموقع غير معروف</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        ))}

        {expanded && fullActivities.length === 0 && (
          <div className="text-center text-gray-500 py-10">لا توجد تسجيلات دخول سابقة</div>
        )}
      </div>
      )}

      <div className="p-3 border-t border-white/30 bg-white/20">
        <button
          onClick={toggleFullLog}
          className="w-full py-2.5 text-green-600 hover:text-green-700 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-green-50 flex items-center justify-center gap-2 group"
        >
          <span>
            {expanded ? '🔼 إخفاء السجل والعودة للعرض المختصر' : '📜 عرض سجل تسجيلات الدخول الكامل'}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          ) : (
            <span className="text-sm group-hover:translate-x-1 transition-transform">←</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;