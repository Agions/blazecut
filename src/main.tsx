import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import './styles/index.less';

// 防止控制台出现错误消息
window.addEventListener('error', (e) => {
  // 忽略与@tauri-apps/api相关的错误
  if (e.message && (e.message.includes('@tauri-apps/api') || e.message.includes('Tauri'))) {
    e.preventDefault();
    console.warn('Tauri API错误已被捕获:', e.message);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 