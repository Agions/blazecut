import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import MainLayout from './components/MainLayout';
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

const App: React.FC = () => {
  const { isDarkMode } = useTheme();
  
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
  
  // 监听主题变化更新meta标签
  useEffect(() => {
    // 更新meta主题色
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#141414' : '#ffffff');
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={antTheme}
    >
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video-analysis" element={<VideoAnalysis />} />
          <Route path="/script-editor" element={<ScriptEditor />} />
          <Route path="/project-management" element={<ProjectManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai-settings" element={<AISettings />} />
          <Route path="/ai-model-evaluation" element={<AIModelEvaluation />} />
        </Routes>
      </MainLayout>
    </ConfigProvider>
  );
};

export default App;
