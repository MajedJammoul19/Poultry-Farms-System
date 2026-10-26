import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/use-auth';

const RoleBasedHome = () => {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!userRole) {
      navigate('/sign-in', { replace: true });
      return;
    }

    // توجيه المستخدم حسب دوره
    switch (userRole) {
      case 'admin':
        navigate('/dashbourd', { replace: true });
        break;
      case 'manager':
        navigate('/dashbourd', { replace: true });
        break;
      case 'employee':
        navigate('/dashbourd', { replace: true });
        break;
      case 'vet':
        navigate('/health-checks', { replace: true });
        break;
      case 'fuel_supplier':
        navigate('/fuel', { replace: true });
        break;
      case 'food_supplier':
        navigate('/food', { replace: true });
        break;
      default:
        navigate('/sign-in', { replace: true });
    }
  }, [userRole, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">جاري التوجيه...</div>
    </div>
  );
};

export default RoleBasedHome;