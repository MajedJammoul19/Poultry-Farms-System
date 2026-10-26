import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import AttendanceHistory from '../components/AttendanceHistory';

const AttendancePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto" dir="rtl">
          <AttendanceHistory />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AttendancePage;
