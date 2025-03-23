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

- **前端框架**：React 19 + TypeScript
- **UI组件**：Ant Design
- **样式处理**：Less
- **构建工具**：Vite
- **桌面应用**：Tauri 2.x
- **状态管理**：React Context API
- **AI集成**：OpenAI & Anthropic API

## 🚀 快速开始

### 开发环境要求

- Node.js 18.0+ 
- Rust (最新稳定版)
- 相关构建工具（详见[Tauri前置要求](https://tauri.app/v1/guides/getting-started/prerequisites/)）

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
# 启动React开发服务器
npm run dev

# 启动Tauri应用
npm run tauri:dev
```

4. 构建应用

```bash
npm run tauri:build
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
