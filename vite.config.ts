import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 防止与Tauri产生冲突
  clearScreen: false,
  // Tauri 在开发中使用固定端口，这样tauri.conf.json中的配置就能在dev期间正常工作
  server: {
    port: 3000,
    strictPort: true,
  },
  // 构建配置
  build: {
    // Tauri默认使用'dist'作为输出目录
    outDir: 'dist',
    // 确保构建足够缓存友好
    target: ['es2021', 'chrome100', 'safari13'],
    // 调试时打开源代码映射
    sourcemap: !!process.env.TAURI_DEBUG,
    // 压缩小型文件也是有意义的
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        static: path.resolve(__dirname, 'src/static-page.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tauri-apps/api': path.resolve(__dirname, 'node_modules/@tauri-apps/api'),
      '@tauri-apps/plugin-dialog': path.resolve(__dirname, 'node_modules/@tauri-apps/plugin-dialog'),
    },
    dedupe: ['@tauri-apps/api', '@tauri-apps/plugin-dialog'],
  },
  optimizeDeps: {
    include: ['@tauri-apps/api', '@tauri-apps/plugin-dialog'],
  }
})
