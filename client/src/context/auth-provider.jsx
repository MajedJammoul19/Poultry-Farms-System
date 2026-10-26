// src/context/auth-provider.jsx
import { useState, useEffect } from 'react';
import { AuthContext } from './auth-context'; // Context for components
import { getTodayAttendance } from '../api/attendance';


const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [lastLogins, setLastLogins] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  // يبدأ بـ true إذا كان المستخدم المحفوظ موظفاً — لمنع وميض الشاشة
  const [attendanceLoading, setAttendanceLoading] = useState(() => {
    try {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role === 'employee';
      }
    } catch {}
    return false;
  });

  // دالة تحديث حالة الحضور — مُعرَّفة قبل useEffect لاستخدامها فيه
  const refreshAttendanceStatus = async () => {
    setAttendanceLoading(true);
    try {
      const result = await getTodayAttendance();
      if (result.success && result.data.hasAttendance) {
        setAttendanceStatus(result.data);
        setIsCheckedInToday(result.data.status === 'checked-in');
      } else {
        setAttendanceStatus(null);
        setIsCheckedInToday(false);
      }
    } catch (error) {
      console.error('Failed to refresh attendance:', error);
      setAttendanceStatus(null);
      setIsCheckedInToday(false);
    } finally {
      setAttendanceLoading(false);
    }
  };


  // _________________________________________________________________________________________________

  useEffect(() => {
    // تحميل حالة الحضور تلقائياً للموظفين (المستخدم محمّل مسبقاً من useState)
    if (user && user.role === 'employee') {
      refreshAttendanceStatus();
    }

    // استرجاع تاريخ آخر المستخدمين
    const savedLogins = localStorage.getItem('lastLogins');
    if (savedLogins) {
      try {
        const parsed = JSON.parse(savedLogins);
        const validatedLogins = parsed.map(login => ({
          ...login,
          timestamp: login.timestamp || Date.now()
        }));
        setLastLogins(validatedLogins);
      } catch (e) {
        console.error('Error parsing lastLogins:', e);
        setLastLogins([]);
      }
    }
  }, []);

  const getEmojiByRole = (role) => {
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

  const signIn = (userData) => {
    // مسح بيانات الطقس عند كل دخول جديد
    sessionStorage.removeItem('weatherTemp');
    sessionStorage.removeItem('weatherCondition');
    sessionStorage.removeItem('weatherData');

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.removeItem('user');

    // تحميل حالة الحضور فور تسجيل الدخول للموظفين
    if (userData.role === 'employee') {
      refreshAttendanceStatus();
    }
    
    const now = Date.now();
    
    // التحقق من وجود سجل لنفس المستخدم خلال آخر 10 ثواني
    const recentLogin = lastLogins.find(login => 
      login.user === userData.name && 
      (now - (login.timestamp || 0)) < 10000
    );
    
    if (recentLogin) {
      console.log('⏳ تم منع إضافة سجل مكرر للمستخدم:', userData.name);
      return;
    }
    
    // إنشاء سجل دخول جديد مع timestamp صحيح
    const newLoginRecord = {
      id: now,
      user: userData.name,
      role: userData.role,
      time: getRelativeTime(now),
      timestamp: now,
      emoji: getEmojiByRole(userData.role)
    };
    
    // إضافة السجل الجديد في البداية، والاحتفاظ بآخر 10 سجلات
    const updatedLogins = [newLoginRecord, ...lastLogins].slice(0, 10);
    
    setLastLogins(updatedLogins);
    localStorage.setItem('lastLogins', JSON.stringify(updatedLogins));
    
  };

    // _________________________________________________________________________________________________

  // دالة مساعدة لحساب الوقت النسبي
  const getRelativeTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `منذ ${seconds} ثانية`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setAttendanceStatus(null);
    setIsCheckedInToday(false);
    setAttendanceLoading(false);
    // مسح بيانات الطقس عند تسجيل الخروج
    sessionStorage.removeItem('weatherTemp');
    sessionStorage.removeItem('weatherCondition');
    sessionStorage.removeItem('weatherData');
  };

  const updateUser = (updatedUserData) => {
    setUser((currentUser) => {
      const nextUser = { ...(currentUser || {}), ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };


  // _________________________________________________________________________________________________

  // دالة لتحديث أوقات جميع السجلات (تُستدعى كل دقيقة)
  const updateTimes = () => {
    setLastLogins(prevLogins => {
      const updated = prevLogins.map(login => ({
        ...login,
        time: getRelativeTime(login.timestamp)
      }));
      localStorage.setItem('lastLogins', JSON.stringify(updated));
      return updated;
    });
  };

  // تحديث الأوقات كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastLogins.length > 0) {
        updateTimes();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lastLogins.length]);

  const clearLoginHistory = () => {
    setLastLogins([]);
    localStorage.removeItem('lastLogins');
  };

  const value = {
    user,
    userRole: user?.role,
    lastLogins,
    attendanceStatus,
    isCheckedInToday,
    attendanceLoading,
    refreshAttendanceStatus,
    signIn,
    signOut,
    updateUser,
    clearLoginHistory,
    updateTimes
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
