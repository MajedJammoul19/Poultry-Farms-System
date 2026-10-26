import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardCards from '../components/DashboardCards';
import RecentActivity from '../components/RecentActivity';
import TasksOverview from '../components/TasksOverview';
import AlertsSection from '../components/AlertsSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🐔 مرحباً بك في لوحة التحكم</h1>
              <p className="text-gray-600">📊 نظرة عامة على أداء المزرعة وإحصائيات اليوم</p>
            </div>

            {/* Dashboard Cards */}
            <DashboardCards />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div className="lg:col-span-1">
                <AlertsSection />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <TasksOverview />

              {/* Additional Info Card */}
              <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/50">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">📈 إحصائيات سريعة</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                    <span className="text-gray-600">🐓 إجمالي الدجاج</span>
                    <span className="text-2xl font-bold text-green-600">12,450</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                    <span className="text-gray-600">🥚 الإنتاج اليومي</span>
                    <span className="text-2xl font-bold text-blue-600">8,230</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                    <span className="text-gray-600">📊 نسبة الإنتاج</span>
                    <span className="text-2xl font-bold text-yellow-600">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;