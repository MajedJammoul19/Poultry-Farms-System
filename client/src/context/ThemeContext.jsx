import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// يعتمد فقط على localStorage — لا يتأثر بإعداد نظام التشغيل
const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('theme') === 'dark';
};

const applyTheme = (isDark) => {
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


// Hook للاستخدام في المكونات
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme يجب أن يُستخدم داخل ThemeProvider');
  }
  return context;
};

export default ThemeContext;
