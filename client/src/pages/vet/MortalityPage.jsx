import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import MortalityAlerts from '../../components/MortalityAlerts';
import RecordMortality from '../../components/RecordMortality';
import Footer from '../../components/Footer';
const Users = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <RecordMortality />
          <MortalityAlerts />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Users;