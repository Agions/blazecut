# BlazeCut - AI Powered Video Script Editor

<p align="center">
  <img src="public/logo.svg" width="120" alt="BlazeCut Logo"/>
</p>

BlazeCut是一款基于人工智能的视频解说脚本生成工具，能够自动分析视频内容，生成专业的解说文案，并支持多种格式导出，包括剪映草稿格式。

## ✨ 主要功能

- **视频分析**：自动提取视频关键内容、情感和重要时刻
- **AI脚本生成**：基于视频分析结果智能生成解说词
- **脚本编辑**：调整解说词内容和时间轴
- **多格式导出**：支持剪映、SRT字幕、纯文本和Final Cut Pro格式导出
- **项目管理**：保存和管理多个创作项目

## 🖥 技术栈

- **前端框架**：React 18 + TypeScript
- **UI组件**：Ant Design 5.x
- **状态管理**：Zustand
- **样式处理**：Less + CSS Modules
- **构建工具**：Vite
- **HTTP客户端**：Axios
- **工具库**：Lodash, dayjs
- **代码规范**：ESLint + Prettier

## 🔧 最新优化

- **状态管理**：引入Zustand状态管理库，改善全局状态管理
- **性能分析**：添加性能监控装饰器，轻松识别性能瓶颈
- **错误处理**：全局错误捕获与处理机制
- **HTTP请求**：封装Axios实现更好的请求管理
- **自定义Hooks**：添加useLocalStorage、useMediaQuery、useDebounce等自定义钩子
- **环境配置**：完善开发和生产环境配置
- **类型定义**：增强TypeScript类型定义，提高代码可靠性
- **构建优化**：改进Vite配置，优化打包体积和加载速度
- **样式变量**：统一管理主题变量，提升UI一致性

## 🚀 快速开始

### 开发环境要求

- Node.js 16.0+ 
- npm 7.0+

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/agions/blazecut.git
cd blazecut
```

2. 安装依赖

```bash
npm install
```

3. 开发模式启动

```bash
# 启动开发服务器
npm run dev
```

4. 构建应用

```bash
npm run build
```

5. 代码格式化

```bash
npm run format
```

## 📝 AI功能配置

BlazeCut支持连接到以下AI服务:

1. **OpenAI** - 支持多种模型，如GPT-4和GPT-3.5
2. **Anthropic** - 支持Claude系列模型
3. **本地模型** - 支持自托管的AI模型（开发中）

要使用AI功能，需要在设置中配置相应的API密钥。

## 🔗 导出功能

BlazeCut支持多种导出格式:

- **剪映草稿** - 可直接导入剪映应用的JSON格式
- **SRT字幕** - 标准字幕格式，兼容大多数视频编辑软件
- **Final Cut Pro XML** - 适用于苹果Final Cut Pro
- **纯文本** - 可用于任何文本编辑器

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献指南

欢迎提交问题和拉取请求。对于重大更改，请先打开issue讨论您想要更改的内容。

## 📚 项目结构

```
src/
├── assets/      # 静态资源文件
├── components/  # 可复用组件
├── context/     # React上下文
├── hooks/       # 自定义React钩子
├── interfaces/  # TypeScript接口定义
├── layouts/     # 页面布局组件
├── pages/       # 页面组件
├── services/    # API服务
├── store/       # 状态管理
├── styles/      # 全局样式和主题
├── types/       # 类型声明文件
└── utils/       # 工具函数
```
