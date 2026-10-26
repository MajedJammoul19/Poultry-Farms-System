import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import EmployeeTable from '../../components/EmployeeTable';
import Footer from '../../components/Footer';
const Employee = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <EmployeeTable />
         
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Employee;
