import React, { useContext, useEffect, useState } from 'react';
import { getAlerts } from '../api/auth';
import { AuthContext } from '../context/auth-context';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
const fullDateFormatter = new Intl.DateTimeFormat('ar-SY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});


const getSeverityStyles = (severity) => {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        text: 'text-red-800',
        badge: 'text-red-600 bg-red-100'
      };
    case 'medium':
      return {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
        border: 'border-amber-200',
        text: 'text-amber-800',
        badge: 'text-amber-600 bg-amber-100'
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-sky-50 to-sky-100',
        border: 'border-sky-200',
        text: 'text-sky-800',
        badge: 'text-sky-600 bg-sky-100'
      };
  }
};

const getAlertIcon = (category) => {
  switch (category) {
    case 'medical':
      return '🩺';
    case 'food':
      return '🌾';
    case 'fuel':
      return '⛽';
    case 'quality':
      return '📦';
    case 'prevention':
      return '🛡️';
    default:
      return '🔔';
  }
};

const formatRelativeTime = (value) => {
  if (!value) {
    return 'الآن';
  }

  const date = new Date(value);
  const diffInMinutes = Math.round((date.getTime() - Date.now()) / (60 * 1000));

  if (Math.abs(diffInMinutes) < 60) {
    return relativeTimeFormatter.format(diffInMinutes, 'minute');
  }

  const diffInHours = Math.round(diffInMinutes / 60);

  if (Math.abs(diffInHours) < 24) {
    return relativeTimeFormatter.format(diffInHours, 'hour');
  }

  const diffInDays = Math.round(diffInHours / 24);

  if (Math.abs(diffInDays) < 7) {
    return relativeTimeFormatter.format(diffInDays, 'day');
  }

  return fullDateFormatter.format(date);
};

const LoadingState = () => (
  <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden h-full flex flex-col">
    <div className="p-6 border-b border-white/30">
      <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
    <div className="flex-1 p-4 space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-xl border border-white/30 bg-white/50 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-full rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AlertsSection = () => {
  const { user, userRole } = useContext(AuthContext) || {};
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAlerts = async () => {
      if (!userRole) {
        if (isMounted) {
          setAlerts([]);
          setDismissedAlerts([]);
          setError('');
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError('');
      }

      try {
        const response = await getAlerts({
          role: userRole,
          email: user?.email || ''
        });

        if (isMounted) {
          setAlerts(Array.isArray(response?.data) ? response.data : []);
          setDismissedAlerts([]);
        }
      } catch (loadError) {
        if (isMounted) {
          setAlerts([]);
          setError(loadError.message || 'تعذر تحميل التنبيهات المهمة');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAlerts();

    return () => {
      isMounted = false;
    };
  }, [user?.email, userRole]);

  const refreshAlerts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAlerts({
        role: userRole,
        email: user?.email || ''
      });

      setAlerts(Array.isArray(response?.data) ? response.data : []);
      setDismissedAlerts([]);
    } catch (loadError) {
      setAlerts([]);
      setError(loadError.message || 'تعذر تحميل التنبيهات المهمة');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAlert = (id) => {
    setDismissedAlerts((currentAlerts) => [...currentAlerts, id]);
  };

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.includes(alert.id));

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/50 text-center">
        <span className="text-4xl mb-3 block">⚠️</span>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">تعذر تحميل التنبيهات</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={refreshAlerts}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/50 text-center">
        <span className="text-5xl mb-3 block">✅</span>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">لا توجد تنبيهات مهمة حالياً</h3>
        <p className="text-sm text-gray-500">سيتم عرض التنبيهات هنا بحسب دور المستخدم والبيانات المسجلة في النظام.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-white/30">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-800">التنبيهات المهمة</h2>
          <span className="text-xs font-semibold text-red-500 bg-red-100 px-2 py-1 rounded-full">
            {visibleAlerts.length} نشط
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {visibleAlerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);

          return (
            <div
              key={alert.id}
              className={`relative ${styles.bg} border ${styles.border} rounded-xl p-4 transition-all duration-300 hover:shadow-md group`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl leading-none">
                  {getAlertIcon(alert.category)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className={`font-semibold ${styles.text}`}>{alert.title}</h3>
                    <span className="text-xs text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                  </div>

                  <p className={`text-sm mt-1 leading-6 ${styles.text}`}>{alert.message}</p>

                  <div className="mt-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                      {alert.severity === 'high' ? 'أولوية عالية' : alert.severity === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400 hover:text-gray-600"
                  aria-label="إخفاء التنبيه"
                >
                  <span className="text-sm">✕</span>
                </button>
              </div>

              {alert.severity === 'high' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-200 rounded-b-xl overflow-hidden">
                  <div className="h-full bg-red-500"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/30 bg-white/20">
        <button
          onClick={refreshAlerts}
          className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors py-2"
        >
          تحديث التنبيهات
        </button>
      </div>
    </div>
  );
};

export default AlertsSection;