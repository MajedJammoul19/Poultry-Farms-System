import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

const DashboardCards = () => {
  // Stats is Cards data from server
  const { stats, loading, fetchDashboardData } = useDashboard();
  const [animatedStats, setAnimatedStats] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (stats.length > 0) {
      // Cards initialized with a value of 0
      const animated = stats.map(stat => ({
        ...stat,
        displayValue: 0
      }));
      setAnimatedStats(animated);

      // For each card, we apply an ascending count
      stats.forEach((stat, index) => {
        const targetValue = parseInt(stat.value) || 0;
        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = targetValue / steps;
        let current = 0;
        let step = 0;

        // Update value every 20ms
        const timer = setInterval(() => {
          step++;
          current += increment;
          if (step >= steps) {
            current = targetValue;
            clearInterval(timer);
          }
          setAnimatedStats(prev => prev.map((s, i) => 
            i === index ? { ...s, displayValue: Math.floor(current) } : s
          ));
        }, stepTime);
      });
    }
  }, [stats]);

  // Select Emoji according to title
  const getEmoji = (title) => {
    const emojiMap = {
      'إجمالي الدجاج': '🐓',
      'الإنتاج اليومي': '🥚',
      'المهام المنجزة': '✅',
      'الموظفين النشطين': '👥'
    };
    return emojiMap[title] || '📊';
  };

  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/50 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {animatedStats.map((stat, index) => (
        <div
          key={stat.title}
          className="group relative overflow-hidden bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="mt-1 text-3xl font-bold text-gray-800">
                  {stat.displayValue?.toLocaleString() || 0}
                </p>
                <p className={`mt-2 text-xs font-medium inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                  stat.change?.startsWith('+') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span>
                    {stat.change?.startsWith('+') ? '📈' : '📉'}
                  </span>
                  {stat.change} عن الأسبوع الماضي
                </p>
              </div>
              <div className="text-4xl">
                {getEmoji(stat.title)}
              </div>
            </div>
            
            <div className="mt-4 h-1 bg-gray-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, (stat.displayValue / (parseInt(stat.value) || 1)) * 100)}%`,
                  backgroundColor: stat.color?.replace('bg-', '').replace('-500', '')
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;