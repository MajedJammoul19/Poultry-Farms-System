import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

import HeatingFuelRequestForm from '../components/HeatingFuelRequestForm';
import AlertsSection from '../components/AlertsSection';
import Footer from '../components/Footer';
import useAuth from '../hooks/use-auth';

const Users = () => {
  const { userRole } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto">
          {userRole === 'fuel_supplier' && (
            <div className="max-w-lg mx-auto mb-6">
              <AlertsSection />
            </div>
          )}
          <HeatingFuelRequestForm />

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Users;
