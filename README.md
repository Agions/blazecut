# BlazeCut - AI 驱动的视频解说脚本生成工具

BlazeCut 是一款基于视频分析和人工智能的视频混剪工具，旨在帮助用户快速生成高质量的视频剪辑。

## 更新日志 (2024年4月2日)

### 新增功能
- **视频混剪功能**：
  - 添加了可视化视频混剪编辑器，支持基于脚本进行视频剪辑
  - 实现了片段预览功能，可以在导出前查看效果
  - 支持多种转场效果（淡入淡出、交叉溶解、擦除效果、滑动效果）
  - 支持音量调整功能，可以对整个视频的音量进行控制
  - 支持添加字幕功能，将脚本内容作为字幕显示
  - 增强了导出设置，支持多种导出格式和质量选项

### 修复问题
- 修复了API密钥申请按钮无法正确跳转到对应大模型申请官网的问题
- 修复了视频处理进度显示不准确的问题
- 优化了视频处理过程中的用户体验，添加了更详细的进度提示
- 修复了多项类型错误和界面布局问题

### 技术改进
- 重构了视频处理逻辑，通过事件监听方式改进了进度反馈机制
- 后端添加了预览生成和临时文件清理功能
- 增强了错误处理和用户反馈机制
- 改进了暗黑模式下的UI适配

## 主要功能

- **视频分析**：自动分析视频内容，识别关键时刻和情感变化
- **脚本生成**：基于视频分析结果，生成符合视频内容的解说脚本
- **脚本编辑**：提供友好的编辑界面，方便用户修改和优化脚本
- **项目管理**：支持多个项目的创建和管理
- **导出功能**：支持导出脚本为多种格式
- **视频混剪**：基于脚本自动生成剪辑视频

## 技术栈

- **前端**：React 18、TypeScript、Ant Design 5、Zustand
- **桌面应用框架**：Tauri (Rust)
- **API 请求**：Axios
- **路由管理**：React Router
- **视频处理**：FFmpeg
- **AI接口**：各大模型API

## 开发环境要求

- Node.js 16+
- npm 7+ 或 pnpm 8+
- Rust 环境（用于 Tauri 开发）

## 安装和运行

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 开发模式

```bash
# 启动前端开发服务器
npm run dev
# 或
pnpm dev

# 启动 Tauri 应用（前端+后端）
npm run tauri dev
# 或
pnpm tauri dev
```

### 构建应用

```bash
# 构建生产版本
npm run tauri build
# 或
pnpm tauri build
```

## 项目结构

```
src/
  ├── assets/        # 静态资源
  ├── components/    # 公共组件
  ├── hooks/         # 自定义 Hooks
  ├── layouts/       # 布局组件
  ├── pages/         # 页面组件
  ├── services/      # API 服务
  ├── store/         # 状态管理
  ├── styles/        # 全局样式
  ├── types/         # 类型定义
  └── utils/         # 工具函数
```

## 主要功能模块

1. **项目管理**：创建、编辑、删除和浏览项目
2. **视频分析**：上传视频并进行内容分析
3. **脚本生成**：基于分析结果自动生成脚本
4. **脚本编辑**：编辑和优化生成的脚本
5. **导出功能**：导出脚本到不同格式
6. **视频混剪**：基于脚本自动生成剪辑视频
7. **设置**：配置 AI 模型和应用选项

## 开发说明

### 技术架构

- 项目使用 TypeScript 进行类型检查
- 使用 Zustand 进行状态管理
- 使用 Ant Design 作为 UI 组件库
- 使用 Less 进行样式开发
- 开发环境下使用模拟数据进行测试
- 采用分层架构设计：UI 层(components/pages)、业务逻辑层(services)、状态管理层(store)
- 使用 React Hooks 进行组件逻辑封装
- 采用 Tauri 提供的 Rust 后端处理视频分析和文件操作

### UI 设计规范

- 色彩系统：主色#1890ff(蓝色)，辅色#13c2c2(青色)，文字色#333(深灰)
- 字体：系统默认字体，优先使用 Ant Design 的 Typography 组件
- 间距：8px 基准单位，使用 Ant Design 的 Space 组件保持一致性
- 动效：所有交互元素需有 0.3s 过渡动画
- 响应式：适配桌面端 1440px 以上分辨率

### 代码规范

- 组件命名：PascalCase(如 VideoUploader)
- 方法命名：camelCase(如 handleUpload)
- 接口命名：I 前缀+PascalCase(如 IVideoInfo)
- 状态管理：使用 Zustand 的 slice 模式组织 store
- 类型定义：所有 props 和 state 必须有 TypeScript 类型定义

### 测试指南

- 单元测试：使用 Jest + Testing Library
- 组件测试：覆盖核心交互和状态变化
- API 测试：使用 Mock Service Worker 模拟 API
- E2E 测试：使用 Cypress 测试关键用户流程

### 部署流程

1. 开发环境：`npm run dev`启动前端，`npm run tauri dev`启动桌面应用
2. 生产构建：`npm run tauri build`生成安装包
3. 持续集成：GitHub Actions 自动运行测试和构建
4. 发布渠道：GitHub Releases 分发安装包

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 开发指南
请查看 [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) 文件以了解如何设置开发环境和进行开发。

## 设计系统
请查看 [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) 文件以了解应用的设计规范和UI组件。
