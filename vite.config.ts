import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 清除控制台Tauri警告
  clearScreen: false,

  // 服务器配置
  server: {
    port: 5173,
    strictPort: true,
  },

  // 预览配置
  preview: {
    port: 5173,
    strictPort: true,
  },

  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1890ff',
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}) 