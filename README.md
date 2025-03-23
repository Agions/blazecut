# BlazeCut - AI Powered Video Script Editor

一款基于Tauri + React + TypeScript开发的桌面应用，帮助创作者快速生成短视频剧本和剪辑方案。

## 项目特点

- 视频分析：自动提取视频关键内容和情感
- AI剧本生成：基于视频分析结果智能生成解说词
- 剧本编辑：支持调整解说词内容和时间轴
- 导出功能：支持多种导出格式，如剪辑软件草稿或SRT字幕文件
- 项目管理：保存、恢复和管理多个剪辑项目
- 跨平台：支持Windows、macOS和Linux

## 技术栈

- **前端框架**：React 19 + TypeScript
- **UI组件**：Ant Design
- **样式处理**：Less
- **构建工具**：Vite
- **桌面应用**：Tauri 2.x
- **状态管理**：React Context API

## 开发环境要求

- Node.js 18.0+ 
- Rust (最新稳定版)
- 相关构建工具（详见[Tauri前置要求](https://tauri.app/v1/guides/getting-started/prerequisites/)）

## 安装步骤

1. 克隆项目

```bash
git clone https://github.com/agions/blazecut.git
cd blazecut
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run tauri:dev
```

## 构建应用

```bash
npm run tauri:build
```

编译后的安装包将位于`src-tauri/target/release/bundle`目录。

## 项目结构

```
/
├── src/                # 前端React源代码
│   ├── components/     # 公共组件
│   ├── pages/          # 页面组件
│   ├── hooks/          # 自定义Hooks
│   ├── utils/          # 工具函数
│   ├── types/          # TypeScript类型定义
│   └── App.tsx         # 应用入口
├── src-tauri/          # Tauri/Rust后端代码
│   ├── src/            # Rust源代码
│   └── Cargo.toml      # Rust依赖配置
└── public/             # 静态资源
```

## 许可证

[MIT License](LICENSE)

## 贡献指南

欢迎提交问题和拉取请求。对于重大更改，请先打开issue讨论您想要更改的内容。
