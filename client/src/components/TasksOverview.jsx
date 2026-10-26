import React, { useState } from 'react';

const TasksOverview = () => {
  const [hoveredTask, setHoveredTask] = useState(null);
  
  const tasks = [
    { id: 1, title: 'تسجيل التغذية اليومية', completed: 4, total: 5, color: 'from-blue-400 to-blue-600', emoji: '🍽️' },
    { id: 2, title: 'الفحوصات البيطرية', completed: 2, total: 3, color: 'from-green-400 to-green-600', emoji: '🩺' },
    { id: 3, title: 'طلبات الشراء المعلقة', completed: 1, total: 3, color: 'from-yellow-400 to-yellow-600', emoji: '🛒' },
    { id: 4, title: 'بلاغات النظافة', completed: 5, total: 5, color: 'from-purple-400 to-purple-600', emoji: '🧹' },
  ];

  return (
    <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden">
      <div className="p-6 border-b border-white/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">📝 نظرة عامة على المهام</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-xs text-gray-500">تقدم المهام</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-5">
        {tasks.map((task) => {
          const percentage = (task.completed / task.total) * 100;
          const isComplete = percentage === 100;
          
          return (
            <div
              key={task.id}
              className="relative group"
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
                  {task.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{task.title}</span>
                    <span className="text-sm font-medium text-gray-500">
                      {task.completed} / {task.total}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${task.color} transition-all duration-1000 ease-out relative overflow-hidden`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
                
                {hoveredTask === task.id && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {Math.round(percentage)}% مكتمل
                  </div>
                )}
              </div>
              
              {isComplete && (
                <div className="absolute -right-2 -top-2">
                  <span className="text-xl">✅</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-white/20 border-t border-white/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">📊 متوسط الإنجاز</span>
          <span className="font-bold text-gray-800">
            {Math.round(tasks.reduce((acc, task) => acc + (task.completed / task.total) * 100, 0) / tasks.length)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default TasksOverview;