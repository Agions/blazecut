import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { getTheme } from '../styles/theme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDarkMode: false
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // 从 localStorage 获取主题设置，如果没有则使用默认值
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'light';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setIsDarkMode(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // 初始检查
    if (theme === 'system') {
      setIsDarkMode(mediaQuery.matches);
    } else {
      setIsDarkMode(theme === 'dark');
    }
    
    // 应用主题到body元素
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f5f7fa';
    document.body.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)';
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isDarkMode]);
  
  // 当主题改变时，更新 localStorage 和文档类
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // 更新 html 类以应用主题
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark-theme');
      htmlElement.classList.remove('light-theme');
    } else {
      htmlElement.classList.add('light-theme');
      htmlElement.classList.remove('dark-theme');
    }
    
    // 通过 CSS 变量设置主题颜色
    if (isDarkMode) {
      htmlElement.style.setProperty('--bg-color', '#141414');
      htmlElement.style.setProperty('--card-bg-color', '#1f1f1f');
      htmlElement.style.setProperty('--text-color', '#ffffff');
      htmlElement.style.setProperty('--border-color', '#303030');
    } else {
      htmlElement.style.setProperty('--bg-color', '#f0f2f5');
      htmlElement.style.setProperty('--card-bg-color', '#ffffff');
      htmlElement.style.setProperty('--text-color', '#000000');
      htmlElement.style.setProperty('--border-color', '#e8e8e8');
    }
  }, [theme, isDarkMode]);
  
  // 更新主题并考虑系统设置
  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    } else {
      setIsDarkMode(newTheme === 'dark');
    }
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // 获取当前主题配置
  const currentTheme = getTheme(isDarkMode);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme, isDarkMode }}>
      <ConfigProvider theme={currentTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;