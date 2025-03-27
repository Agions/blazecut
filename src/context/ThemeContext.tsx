import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 从localStorage加载主题设置
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
    } else {
      // 也可以根据系统主题来设置
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    
    // 根据主题设置修改body类
    updateBodyClass(isDarkMode);
  }, []);

  useEffect(() => {
    // 更新localStorage和body类
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateBodyClass(isDarkMode);
  }, [isDarkMode]);

  const updateBodyClass = (dark: boolean) => {
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Ant Design的主题配置
  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 自定义Hook，方便在组件中使用主题上下文
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 