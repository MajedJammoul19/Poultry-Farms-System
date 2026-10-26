// pages/UpdateDashboardPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

const UpdateDashboardPage = () => {
  const navigate = useNavigate();
  const { fetchDashboardData } = useDashboard();
  
  const [selectedCard, setSelectedCard] = useState('');
  const [formData, setFormData] = useState({
    value: '',
    change: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const cards = [
    { title: 'إجمالي الدواجن', icon: 'pets', color: 'bg-blue-100 text-blue-800' },
    { title: 'الإنتاج اليومي', icon: 'show_chart', color: 'bg-green-100 text-green-800' },
    { title: 'المواد الغذائية', icon: 'local_dining', color: 'bg-yellow-100 text-yellow-800' },
    { title: 'الوقود المتاح', icon: 'local_gas_station', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCard) {
      setMessage('الرجاء اختيار الكارد');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const encodedTitle = encodeURIComponent(selectedCard);
      await axios.put(`/api/dashboard-data/${encodedTitle}`, formData);
      
      setMessage('✅ تم تحديث البيانات بنجاح');
      setFormData({ value: '', change: '' });
      setSelectedCard('');
      
      // تحديث البيانات في Context
      await fetchDashboardData();
      
      // بعد 2 ثانية اذهب للـ Dashboard
      setTimeout(() => {
        navigate('/dashbourd');
      }, 2000);
      
    } catch (error) {
      console.error('❌ خطأ:', error);
      setMessage('❌ فشل في تحديث البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">تحديث بيانات الكروت</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* نفس محتوى الفورم من قبل */}
            <div>
              <label className="block text-sm font-medium mb-1">اختر الكارد</label>
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- اختر --</option>
                {cards.map(card => (
                  <option key={card.title} value={card.title}>
                    {card.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">القيمة الجديدة</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">نسبة التغيير</label>
              <input
                type="text"
                value={formData.change}
                onChange={(e) => setFormData({...formData, change: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded ${
                message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التحديث...' : 'تحديث البيانات'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashbourd')}
              className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 mt-2"
            >
              العودة للوحة التحكم
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateDashboardPage;