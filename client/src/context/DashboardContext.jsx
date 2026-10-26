// context/DashboardContext.jsx
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// save Dashboard data and share it between components
const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};


export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard-data');
      setStats(response.data.data);
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider value={{
      stats,
      loading,
      fetchDashboardData,
      setStats
    }}>
      {children}
    </DashboardContext.Provider>
  );
};