// components/GuestRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/use-auth';

// يمنع مستخدماً مسجّلاً دخوله من الوصول لصفحتي تسجيل الدخول/إنشاء الحساب
// (مثلاً عبر زر الرجوع في المتصفح) طالما جلسته ما تزال فعالة
const GuestRoute = ({ children }) => {
  const { userRole } = useAuth();

  if (userRole) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default GuestRoute;
