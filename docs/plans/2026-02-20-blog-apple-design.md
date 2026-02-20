# 博客页面 Apple 设计重构

## 概述

将博客列表页面重构为 Apple 大胆风格，保持筛选搜索功能完整。

## 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| Hero 风格 | 大胆 Hero | 全屏大胆标题 + 渐变背景，强调品牌感 |
| 筛选栏样式 | 融入 Hero | 搜索框放大突出，分类/标签作为筛选标签 |
| 卡片布局 | 水平卡片 | 保持现有布局，阅读体验好 |
| 分页样式 | 数字分页 | 清晰直观，保持现有功能 |

## 页面结构

```
┌─────────────────────────────────────────────────────┐
│              [渐变背景 + 动态光晕]                   │
│                    Blog                             │
│            探索技术文章与学习笔记                    │
│     ┌─────────────────────────────────────┐        │
│     │  🔍 搜索博客...                     │        │
│     └─────────────────────────────────────┘        │
│     [全部] [React] [Next.js] [TypeScript] ...      │
├─────────────────────────────────────────────────────┤
│  [博客卡片列表]                                     │
│           < 1 2 3 ... 10 >  共 50 篇               │
└─────────────────────────────────────────────────────┘
```

## 核心变更

### 1. page.tsx - Hero 区域重构

- 添加全屏 Hero，动态渐变背景
- 大标题 "Blog" + 副标题
- 筛选栏融入 Hero 底部

### 2. blog-filter-bar.tsx - 筛选栏重构

- 搜索框放大居中，focus 时光晕效果
- 分类改为标签按钮组（横向滚动）
- 标签改为标签按钮组（横向滚动）
- 排序保留下拉，样式优化

### 3. blog-card.tsx - 卡片样式优化

- 圆角增大：`rounded-2xl`
- Hover 效果：`shadow-lg -translate-y-0.5`
- 过渡动画：`duration-300 ease-apple`

## 样式规范

### Hero 区域

| 元素 | 样式 |
|------|------|
| 容器 | `min-h-[50vh] md:min-h-[60vh]` |
| 标题 | `text-5xl md:text-7xl font-bold` |
| 副标题 | `text-lg md:text-xl text-text-secondary` |
| 搜索框 | `w-full max-w-xl rounded-2xl` |
| 搜索框 focus | `ring-4 ring-accent/20` |

### 筛选标签

| 元素 | 样式 |
|------|------|
| 标签按钮 | `rounded-full px-4 py-2 text-sm` |
| 选中态 | `bg-accent text-white` |
| 未选中态 | `bg-surface/50 text-text-secondary hover:bg-surface` |

### 博客卡片

| 元素 | 样式 |
|------|------|
| 容器 | `rounded-2xl overflow-hidden` |
| Hover | `shadow-lg -translate-y-0.5` |
| 过渡 | `transition-all duration-300 ease-apple` |

## 功能保证

- ✅ 搜索功能：通过 URL 参数 `title` 实现
- ✅ 分类筛选：通过 URL 参数 `categoryId` 实现
- ✅ 标签筛选：通过 URL 参数 `tagId` 实现
- ✅ 排序功能：通过 URL 参数 `sortBy` / `order` 实现
- ✅ 分页功能：通过 URL 参数 `page` 实现

## 文件变更

- `app/(site)/blog/page.tsx` - Hero 区域重构
- `components/blog/blog-filter-bar.tsx` - 筛选栏重构
- `components/blog/blog-card.tsx` - 卡片样式优化
