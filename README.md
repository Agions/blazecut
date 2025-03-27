# BlazeCut - AI驱动的视频解说脚本生成工具

BlazeCut 是一个基于 AI 技术的视频解说脚本生成工具，它可以帮助内容创作者快速生成高质量的视频解说脚本。

## 主要功能

- **视频分析**：自动分析视频内容，识别关键时刻和情感变化
- **脚本生成**：基于视频分析结果，生成符合视频内容的解说脚本
- **脚本编辑**：提供友好的编辑界面，方便用户修改和优化脚本
- **项目管理**：支持多个项目的创建和管理
- **导出功能**：支持导出脚本为多种格式

## 技术栈

- **前端**：React 18、TypeScript、Ant Design 5、Zustand
- **桌面应用框架**：Tauri (Rust)
- **API请求**：Axios
- **路由管理**：React Router

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
6. **设置**：配置 AI 模型和应用选项

## 开发说明

- 项目使用 TypeScript 进行类型检查
- 使用 Zustand 进行状态管理
- 使用 Ant Design 作为 UI 组件库
- 使用 Less 进行样式开发
- 开发环境下使用模拟数据进行测试

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件 