import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

import MedicalForm from '../components/MedicalForm'
import Footer from '../components/Footer';
const Users = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <MedicalForm />
         
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Users;
