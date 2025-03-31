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
  }, []);

  const applyTheme = (dark: boolean) => {
    const rootElement = document.documentElement;
    
    if (dark) {
      rootElement.classList.add('dark-theme');
      document.body.style.backgroundColor = '#141414';
      document.body.style.color = 'rgba(255, 255, 255, 0.85)';
    } else {
      rootElement.classList.remove('dark-theme');
      document.body.style.backgroundColor = '#fff';
      document.body.style.color = 'rgba(0, 0, 0, 0.85)';
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