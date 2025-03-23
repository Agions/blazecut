import AISettings from './pages/AISettings';
import ScriptEditor from './pages/ScriptEditor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/video-analysis',
        element: <VideoAnalysis />
      },
      {
        path: '/script-editor',
        element: <ScriptEditor />
      },
      {
        path: '/project-management',
        element: <ProjectManagement />
      },
      {
        path: '/settings',
        element: <Settings />
      },
      {
        path: '/ai-settings',
        element: <AISettings />
      }
    ]
  }
]);

export default router; 