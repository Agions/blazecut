import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/Basic.css';

// 页面导入
import Home from './pages/Home';
import VideoAnalysis from './pages/VideoAnalysis';
import ScriptEditor from './pages/ScriptEditor';
import ProjectManagement from './pages/ProjectManagement';
import Settings from './pages/Settings';
import AISettings from './pages/AISettings';
import AIModelEvaluation from './pages/AIModelEvaluation';
import { useTheme } from './context/ThemeContext';
import colorPalettes from './styles/colorPalettes';
import useAppStore from './store/useAppStore';
import { setupGlobalErrorHandlers } from './utils/errorHandler';

const App: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { language } = useAppStore();
  
  // 设置全局错误处理
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);
  
  // 设置Ant Design主题
  const antTheme = {
    token: {
      colorPrimary: colorPalettes.default.primary,
      borderRadius: 6,
    },
    algorithm: isDarkMode ? 
      [theme.darkAlgorithm] : 
      [theme.defaultAlgorithm]
  };
  
  // 根据全局状态选择语言
  const locale = language === 'zh-CN' ? zhCN : enUS;
  
  // 监听主题变化更新meta标签
  useEffect(() => {
    // 更新meta主题色
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#141414' : '#ffffff');
    }
    
    // 设置body类以便全局样式的应用
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={locale}
        theme={antTheme}
      >
        <AntdApp>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/video-analysis" element={
                <ErrorBoundary>
                  <VideoAnalysis />
                </ErrorBoundary>
              } />
              <Route path="/script-editor" element={
                <ErrorBoundary>
                  <ScriptEditor />
                </ErrorBoundary>
              } />
              <Route path="/project-management" element={<ProjectManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-settings" element={<AISettings />} />
              <Route path="/ai-model-evaluation" element={<AIModelEvaluation />} />
            </Routes>
          </MainLayout>
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
