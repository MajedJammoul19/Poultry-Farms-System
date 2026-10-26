import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import toast, { Toaster } from 'react-hot-toast'; // Toast notifications

const Header = () => {
  const navigate = useNavigate();
  const { signOut } = useContext(AuthContext);

  // دالة التحقق من الطقس
  const checkWeather = async () => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=24.71&longitude=46.67&current_weather=true`
      );

      const data = await response.json();
      console.log(data)
      const temp = data.current_weather.temperature;

      // تغيير اللون حسب الحرارة
      const bell = document.getElementById('weather-bell');

      if (temp <= 0) {
        toast.error(`⚠️ الطقس بارد جداً: ${temp}°C`);
        if (bell) bell.classList.add('bg-blue-300'); // لون أزرق بارد
      } else if (temp >= 40) {
        toast.error(`🔥 الطقس حار جداً: ${temp}°C`);
        if (bell) bell.classList.add('bg-red-400'); // لون أحمر حار
      } else {
        toast.success(`🌤️ الطقس معتدل: ${temp}°C`);
        if (bell) bell.classList.add('bg-green-300'); // لون أخضر معتدل
      }
    } catch (err) {
      console.error('حدث خطأ في جلب الطقس:', err);
      toast.error('تعذر الحصول على بيانات الطقس');
    }
  };

  return (
   <header className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 shadow-sm">
  <Toaster position="top-right" reverseOrder={false} />

  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

    {/* عنوان النظام */}
    <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-wide">
      نظام إدارة المنشأة الزراعية
    </h1>

    <div className="flex items-center gap-6">

      {/* أيقونة الجرس */}
      <div className="relative group">
        <button
          id="weather-bell"
          onClick={checkWeather}
          className="p-3 rounded-full bg-white shadow-md border border-gray-200 
                     text-gray-600 hover:bg-blue-100 hover:text-blue-700 
                     transition-all duration-300 transform hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* النقطة الحمراء */}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
      </div>

      {/* زر تسجيل الخروج */}
      <button
        onClick={() => {
          signOut();
          navigate('/sign-in');
        }}
        className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold 
                   rounded-xl shadow-md 
                   hover:bg-red-600 hover:shadow-lg 
                   active:scale-95 
                   transition-all duration-300"
      >
        تسجيل الخروج
      </button>

    </div>
  </div>
</header>

  );
};

export default Header;
