import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Shows automatic mortality-threshold alerts for the logged-in Veterinarian.
// Fetched on page load - no WebSockets needed, matches the "simple & easy" scope.
const MortalityAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token'); // adapt to your auth storage

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/alerts?onlyUnread=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.alerts || []); // fallback so state is never undefined
    } catch (err) {
      setError('حدث خطأ أثناء جلب التنبيهات');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `/api/alerts/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <p className="text-gray-500 text-sm p-4">...جاري تحميل التنبيهات</p>;
  if (error) return <p className="text-red-600 text-sm p-4">{error}</p>;

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        تنبيهات ارتفاع نسبة النفوق
      </h3>

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-sm">لا يوجد تنبيهات حالياً</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert._id}
              className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-md px-3 py-2"
            >
              <span className="text-sm text-red-800">{alert.message}</span>
              <button
                onClick={() => markAsRead(alert._id)}
                className="shrink-0 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 transition-colors"
              >
                تمييز كمقروء
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MortalityAlerts;