import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import App from './App'
import './styles/Basic.css'
import { ThemeProvider } from './context/ThemeContext'

console.log('初始化React应用')

try {
  const rootElement = document.getElementById('root')
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ThemeProvider>
          <ConfigProvider locale={zhCN}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ConfigProvider>
        </ThemeProvider>
      </React.StrictMode>
    )
    console.log('React应用已渲染')
  } else {
    console.error('未找到root元素')
  }
} catch (error) {
  console.error('初始化React应用时出错:', error)
}
