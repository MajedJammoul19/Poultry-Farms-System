// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/use-auth';

// Define role hierarchy (make sure these match your user roles)
const ROLE_HIERARCHY = {
  admin:         ['admin'],
  manager:       ['manager'],
  vet:           ['vet'],
  employee:      ['employee'],
  food_supplier: ['food_supplier'],
  fuel_supplier: ['fuel_supplier'],
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userRole } = useAuth();


  // Check if user has permission
  const hasPermission = allowedRoles.some(role => 
    ROLE_HIERARCHY[role]?.includes(userRole)
  );

  if (!hasPermission) {
    // Redirect to sign-in or an unauthorized page
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;