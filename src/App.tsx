import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, message, theme } from 'antd';
import { useTheme } from '@/context/ThemeContext';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectEdit from '@/pages/ProjectEdit';
import ScriptDetail from '@/pages/ScriptDetail';
import Settings from '@/pages/Settings';
import { ensureAppDataDir } from '@/services/tauriService';
import zhCN from 'antd/locale/zh_CN';

const App: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  // 应用初始化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('应用初始化...');
        await ensureAppDataDir();
        console.log('应用数据目录检查完成');
      } catch (error) {
        console.error('应用初始化失败:', error);
        message.error('应用初始化失败，部分功能可能无法正常使用');
      }
    };
    
    initializeApp();
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        algorithm: isDarkMode ? 
          theme.darkAlgorithm : 
          theme.defaultAlgorithm,
      }}
    >
      <AntdApp>
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<ProjectEdit />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/edit" element={<ProjectEdit />} />
              <Route path="projects/:projectId/scripts/:scriptId" element={<ScriptDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App; 