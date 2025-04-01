# BlazeCut 开发指南

## 项目架构概述

BlazeCut 采用前后端分离架构，前端使用 React + TypeScript，后端使用 Tauri (Rust)。

### 前端架构

- **组件化开发**：基于 React 函数组件和 Hooks
- **状态管理**：使用 Zustand 进行全局状态管理
- **UI 库**：Ant Design 作为基础组件库
- **样式**：Less 预处理器 + CSS Modules
- **路由**：React Router v6

### 后端架构

- **核心功能**：视频处理、文件操作、AI 模型集成
- **通信方式**：通过 Tauri 提供的 IPC 机制与前端交互

## 代码规范

### TypeScript

- 严格类型检查
- 接口优先设计
- 避免使用 any 类型

### React

- 函数组件优先
- 合理使用 Hooks
- 组件拆分原则：单一职责

### 命名约定

- 组件：PascalCase (如 `VideoUploader.tsx`)
- 非组件：camelCase
- 接口：I 前缀 (如 `IVideoInfo`)
- 类型文件：`.ts` 后缀

## 开发流程

### 分支策略

- `main`：生产环境代码
- `develop`：集成开发分支
- `feature/*`：功能开发分支
- `fix/*`：问题修复分支

### 提交规范

遵循 Conventional Commits：

- `feat:` 新功能
- `fix:` bug 修复
- `docs:` 文档变更
- `style:` 代码样式
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具变更

## 测试策略

### 单元测试

- 测试工具：Jest + Testing Library
- 测试范围：工具函数、业务逻辑

### 集成测试

- 测试工具：Cypress
- 测试范围：关键用户流程

## 性能优化

### 前端

- 代码分割
- 懒加载
- 虚拟列表

### 后端

- 异步处理
- 内存管理
- 并行计算

## 调试技巧

### 前端

- React DevTools
- Redux DevTools (Zustand 兼容)

### 后端

- Rust 调试工具
- Tauri 日志

## 常见问题

1. **Tauri 环境配置**：确保 Rust 工具链正确安装
2. **跨平台兼容性**：测试不同操作系统行为
3. **AI 模型集成**：注意模型大小和性能影响

## 扩展开发

### 添加新功能

1. 在 `pages/` 创建新页面
2. 在 `services/` 添加业务逻辑
3. 在 `store/` 定义状态
4. 在 `types/` 定义类型

### 集成新 AI 模型

1. 在 `src-tauri/src/` 添加模型处理逻辑
2. 通过 IPC 暴露接口
3. 在前端 `services/ai.ts` 封装调用

## 参考资料

1. [React 文档](https://react.dev)
2. [TypeScript 手册](https://www.typescriptlang.org/docs)
3. [Tauri 指南](https://tauri.app)
4. [Ant Design 文档](https://ant.design)
