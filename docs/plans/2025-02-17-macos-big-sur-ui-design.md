# macOS Big Sur 风格组件库设计文档

## 概述

在当前 Next.js 项目中集成一个内部组件库，融合 macOS Big Sur 设计元素与现代 Web 设计趋势，支持深色/浅色多主题。

## 设计语言

### 核心设计特征

- **毛玻璃效果**：使用 backdrop-blur 实现半透明磨砂玻璃感
- **大圆角**：按钮、卡片等组件使用更大的圆角（16-24px）
- **柔和阴影**：多层阴影营造层次感和深度
- **SF Pro 风格字体**：使用系统默认字体栈
- **渐变与高光**：微妙的渐变和高光增加质感

### 配色方案

**浅色模式：**
- 背景色：`#ffffff` / `#f5f5f7`
- 表面色：`#ffffff` + `backdrop-blur(20px)`
- 边框色：`rgba(0, 0, 0, 0.08)`
- 主要色：`#007aff`（系统蓝）
- 次要色：`#8e8e93`（系统灰）

**深色模式：**
- 背景色：`#1c1c1e` / `#000000`
- 表面色：`#2c2c2e` + `backdrop-blur(20px)`
- 边框色：`rgba(255, 255, 255, 0.1)`
- 主要色：`#0a84ff`（系统蓝）
- 次要色：`#98989d`（系统灰）

## 架构设计

```
components/
├── ui/                    # 组件目录
│   ├── button/            # 按钮
│   │   ├── button.tsx
│   │   └── index.ts
│   ├── input/             # 输入框
│   │   ├── input.tsx
│   │   └── index.ts
│   ├── textarea/          # 文本框
│   │   ├── textarea.tsx
│   │   └── index.ts
│   ├── select/            # 选择器
│   │   ├── select.tsx
│   │   └── index.ts
│   ├── dialog/            # 模态框
│   │   ├── dialog.tsx
│   │   └── index.ts
│   ├── drawer/            # 抽屉
│   │   ├── drawer.tsx
│   │   └── index.ts
│   ├── popover/           # 弹窗
│   │   ├── popover.tsx
│   │   └── index.ts
│   ├── card/              # 卡片
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── badge/             # 徽章
│   │   ├── badge.tsx
│   │   └── index.ts
│   ├── tag/               # 标签
│   │   ├── tag.tsx
│   │   └── index.ts
│   └── index.ts           # 统一导出
├── primitives/            # Radix UI 原语封装
└── base/                  # 基础组件
styles/
└── global.css             # 全局样式和 CSS 变量
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | v4 | 样式系统 |
| CSS Variables | - | 主题管理 |
| @radix-ui/* | 最新 | 无障碍原语 |
| class-variance-authority | ^0.7.1 | 组件变体管理 |
| clsx | ^2.1.1 | 类名合并 |
| tailwind-merge | ^3.4.0 | Tailwind 类名合并 |
| next-themes | ^0.4.6 | 主题切换 |

## 组件清单

### 首批实现

| 分类 | 组件 | Radix UI 依赖 | 说明 |
|------|------|---------------|------|
| 基础按钮 | Button | @radix-ui/react-slot | 默认、主要、次要、幽灵、链接样式 |
| 表单组件 | Input | - | 文本输入框，带焦点状态 |
| | Textarea | - | 多行文本输入 |
| | Select | @radix-ui/react-select | 下拉选择器 |
| 对话框 | Dialog | @radix-ui/react-dialog | 模态对话框 |
| | Drawer | vaul | 侧边抽屉 |
| | Popover | @radix-ui/react-popover | 悬浮弹窗 |
| 展示组件 | Card | - | 卡片容器 |
| | Badge | - | 徽章指示器 |
| | Tag | - | 标签 |

## 组件设计规范

### 通用规范

- 所有组件支持 `className` prop 用于自定义样式
- 所有组件支持 `...rest` 传递其他原生属性
- 使用 `forwardRef` 支持 ref 转发
- 使用 `cva` 管理组件变体

### Button 组件设计

```tsx
// 变体
variant: "default" | "primary" | "secondary" | "ghost" | "link"
size: "sm" | "md" | "lg"
```

**样式特征：**
- 圆角：12px
- 毛玻璃背景（ghost 变体）
- 悬停时轻微缩放和阴影增强

### Input 组件设计

```tsx
// 变体
variant: "default" | "filled"
size: "sm" | "md" | "lg"
```

**样式特征：**
- 圆角：8px
- 聚焦时发光效果
- 输入时清除按钮

### Dialog 组件设计

```tsx
// 特征
- backdrop-blur 遮罩
- 缩放动画进入/退出
- 大圆角（16px）
- 毛玻璃背景
```

### Card 组件设计

```tsx
// 结构
<Card>
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

**样式特征：**
- 圆角：16px
- 毛玻璃背景
- 柔和阴影

## CSS 变量定义

```css
:root {
  /* 颜色 - 浅色模式 */
  --background: 0 0% 100%;
  --foreground: 0 0% 10%;
  --surface: 0 0% 100%;
  --surface-foreground: 0 0% 10%;
  --border: 0 0% 90%;
  --primary: 211 100% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 60%;
  --secondary-foreground: 0 0% 100%;
  --accent: 0 0% 96%;
  --accent-foreground: 0 0% 10%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* 毛玻璃 */
  --backdrop-blur: 20px;
  --backdrop-saturate: 180%;
}

.dark {
  /* 颜色 - 深色模式 */
  --background: 0 0% 10%;
  --foreground: 0 0% 95%;
  --surface: 0 0% 12%;
  --surface-foreground: 0 0% 95%;
  --border: 0 0% 20%;
  --primary: 214 100% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 60%;
  --secondary-foreground: 0 0% 100%;
  --accent: 0 0% 16%;
  --accent-foreground: 0 0% 95%;
  --muted: 0 0% 16%;
  --muted-foreground: 0 0% 60%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
}
```

## 文档

- 设计决策记录：本文档
- 组件使用示例：`app/examples` 目录
- API 文档：组件源码中的 TypeScript 类型定义

## 下一步

进入实施计划制定阶段。
