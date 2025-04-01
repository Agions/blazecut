# BlazeCut 设计系统

## 设计原则

1. **简洁性**：界面简洁直观，减少不必要的元素
2. **一致性**：保持组件和交互方式的一致性
3. **高效性**：优化工作流程，减少用户操作步骤
4. **可访问性**：符合 WCAG 2.1 AA 标准

## 颜色系统

### 主色调

- 主色：`#1890ff` (Ant Design 默认蓝色)
- 辅助色：`#13c2c2` (青色)
- 强调色：`#722ed1` (紫色)

### 中性色

- 文字：`rgba(0, 0, 0, 0.85)`
- 次要文字：`rgba(0, 0, 0, 0.45)`
- 边框：`#d9d9d9`
- 背景：`#f0f2f5`

## 排版

### 字体

- 系统默认字体栈：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- 代码字体：`'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`

### 字号

- 标题 1：`38px`
- 标题 2：`30px`
- 标题 3：`24px`
- 正文：`14px`
- 辅助文字：`12px`

## 间距系统

基于 8px 网格系统：

- 小间距：`8px`
- 中间距：`16px`
- 大间距：`24px`
- 超大间距：`32px`

## 组件规范

### 按钮

- 主按钮：圆角`4px`，高度`32px`，内边距`0 16px`
- 次按钮：边框`1px solid #d9d9d9`
- 危险操作：使用红色按钮`#ff4d4f`

### 表单

- 输入框高度：`32px`
- 标签对齐：左对齐
- 错误状态：红色边框和提示文字

### 卡片

- 圆角：`4px`
- 阴影：`0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)`
- 内边距：`16px 24px`

## 动效规范

- 基础过渡：`0.3s cubic-bezier(0.645, 0.045, 0.355, 1)`
- 悬停效果：轻微放大和阴影增强
- 加载动画：使用 Ant Design Spin 组件

## 图标系统

- 使用 Ant Design 图标库
- 自定义图标尺寸：`16px`/`24px`/`32px`
- 填充图标：实心风格
- 线性图标：描边风格

## 响应式设计

- 断点：
  - 小屏幕：`<576px`
  - 中屏幕：`≥576px`
  - 大屏幕：`≥768px`
  - 超大屏幕：`≥992px`
  - 特大屏幕：`≥1200px`
- 布局策略：栅格系统配合媒体查询

## 暗黑模式

- 背景色：`#141414`
- 文字色：`rgba(255, 255, 255, 0.85)`
- 边框色：`#424242`
- 卡片背景：`#1f1f1f`

## 设计资源

1. [Ant Design 设计资源](https://ant.design/docs/resources)
2. [Figma UI Kit](https://www.figma.com/community/file/831698976089831988)
3. [Adobe Color](https://color.adobe.com/)
