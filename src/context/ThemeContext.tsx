import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {}
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // 从localStorage读取主题设置
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 如果有保存的主题设置，使用该设置；否则，使用系统偏好
    const initialDarkMode = savedTheme 
      ? savedTheme === 'dark'
      : prefersDark;
    
    setIsDarkMode(initialDarkMode);
    
    // 应用主题
    applyTheme(initialDarkMode);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (savedTheme === null) {
        // 如果用户未手动设置主题，则跟随系统
        setIsDarkMode(e.matches);
        applyTheme(e.matches);
      }
    };
    
    // 添加事件监听
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
    }
    
    // 清理函数
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const applyTheme = (dark: boolean) => {
    const rootElement = document.documentElement;
    
    if (dark) {
      rootElement.classList.add('dark-theme');
      document.body.style.backgroundColor = '#141414';
      document.body.style.color = 'rgba(255, 255, 255, 0.85)';
      
      // 添加CSS变量以便于使用和覆盖
      rootElement.style.setProperty('--text-color-primary', 'rgba(255, 255, 255, 0.85)');
      rootElement.style.setProperty('--text-color-secondary', 'rgba(255, 255, 255, 0.65)');
      rootElement.style.setProperty('--text-color-disabled', 'rgba(255, 255, 255, 0.35)');
      rootElement.style.setProperty('--bg-color-primary', '#141414');
      rootElement.style.setProperty('--bg-color-secondary', '#1f1f1f');
      rootElement.style.setProperty('--bg-color-component', '#1f1f1f');
      rootElement.style.setProperty('--border-color', '#303030');
      
      // 修复表单标签颜色
      rootElement.style.setProperty('--form-label-color', 'rgba(255, 255, 255, 0.85)');
      
      // 避免深色下的半透明叠加
      document.body.querySelectorAll('.ant-form-item-label > label').forEach(
        (el) => (el as HTMLElement).style.color = 'rgba(255, 255, 255, 0.85)'
      );
    } else {
      rootElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = 'rgba(0, 0, 0, 0.85)';
      
      // 重置CSS变量
      rootElement.style.setProperty('--text-color-primary', 'rgba(0, 0, 0, 0.85)');
      rootElement.style.setProperty('--text-color-secondary', 'rgba(0, 0, 0, 0.65)');
      rootElement.style.setProperty('--text-color-disabled', 'rgba(0, 0, 0, 0.35)');
      rootElement.style.setProperty('--bg-color-primary', '#ffffff');
      rootElement.style.setProperty('--bg-color-secondary', '#f0f2f5');
      rootElement.style.setProperty('--bg-color-component', '#ffffff');
      rootElement.style.setProperty('--border-color', '#d9d9d9');
      
      // 重置表单标签颜色
      rootElement.style.setProperty('--form-label-color', 'rgba(0, 0, 0, 0.85)');
      
      document.body.querySelectorAll('.ant-form-item-label > label').forEach(
        (el) => (el as HTMLElement).style.color = ''
      );
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    applyTheme(newDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 