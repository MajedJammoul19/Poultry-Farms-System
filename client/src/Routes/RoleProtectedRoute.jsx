import { Navigate } from "react-router-dom";
import useAuth from "../hooks/use-auth";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { userRole, loading } = useAuth();

  // انتظر تحميل بيانات المستخدم
  if (loading) {
    return <div>Loading...</div>;
  }

  // لو غير مسجل دخول
  if (!userRole) {
    return <Navigate to="/sign-in" replace />;
  }

  // تحويل الدور والدور المسموح به ل lower case للتأكد من المطابقة
  const normalizedUserRole = userRole.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.trim().toLowerCase());

  // لو ليس لديه صلاحية
  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/unauthorized" replace />; // صفحة غير مصرح له
  }

  return children;
};

export default RoleProtectedRoute;
