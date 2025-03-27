import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getVersion } from '@tauri-apps/api/app';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import ProjectEdit from '@/pages/ProjectEdit';
import ScriptDetail from '@/pages/ScriptDetail';
import Settings from '@/pages/Settings';

const App: React.FC = () => {
  useEffect(() => {
    // 获取Tauri应用信息
    const getTauriVersion = async () => {
      try {
        const appVersion = await getVersion();
        console.log('应用版本:', appVersion);
      } catch (error) {
        console.error('获取Tauri版本失败:', error);
      }
    };

    getTauriVersion();
  }, []);

  return (
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
  );
};

export default App; 