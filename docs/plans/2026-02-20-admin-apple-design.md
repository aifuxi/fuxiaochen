# Admin 后台管理页面 Apple 设计重构

## 概述

将 app/(admin) 下的所有页面重构为 Apple 大胆风格，列表页面支持显示总数和分页。

## 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 重构范围 | 全部一起 | 风格统一 |
| 侧边栏风格 | 固定侧边栏 | 保持现有布局，优化样式 |
| 分页方式 | 数字分页 | 传统方式，清晰直观 |

## 页面结构

```
┌────────────────────────────────────────────────────────┐
│  [侧边栏 64px]  │     主内容区                          │
│                │                                        │
│  ┌──────────┐  │  ┌──────────────────────────────────┐ │
│  │  Logo    │  │  │  页面标题 + 操作按钮              │ │
│  ├──────────┤  │  ├──────────────────────────────────┤ │
│  │  仪表盘  │  │  │                                  │ │
│  │  分类    │  │  │     卡片容器                      │ │
│  │  标签    │  │  │     (表格/表单内容)               │ │
│  │  博客    │  │  │                                  │ │
│  │  更新    │  │  ├──────────────────────────────────┤ │
│  │  用户    │  │  │  共 X 条  < 1 2 3 ... >         │ │
│  ├──────────┤  │  └──────────────────────────────────┘ │
│  │  用户信息 │  │                                        │
│  └──────────┘  │                                        │
└────────────────────────────────────────────────────────┘
```

## 核心变更

### 1. 布局 (layout.tsx)

- 侧边栏宽度: `w-64`
- 主内容区: `ml-64 flex-1`
- 内边距: `p-6 md:p-8`

### 2. 侧边栏 (admin-sidebar.tsx)

- Logo 区域: 简洁设计，品牌色 + 标题
- 导航项:
  - 圆角: `rounded-xl`
  - 活跃态: `bg-accent text-white`
  - Hover: `bg-surface-hover`
- 底部用户区: 头像 + 名称 + 退出按钮

### 3. 仪表盘 (admin/page.tsx)

- 页面标题: `text-3xl font-bold`
- 统计卡片网格: `grid-cols-2 md:grid-cols-4`
- 最新文章表格: 保持现有样式

### 4. 列表页面 (*-list.tsx)

统一结构：

```tsx
<div className="space-y-6">
  {/* 标题区 */}
  <div className="flex items-center justify-between">
    <h2 className="text-3xl font-bold text-text">页面标题</h2>
    <Button>新建</Button>
  </div>

  {/* 工具栏 */}
  <AppleCard className="p-4">
    <form>搜索框 + 筛选</form>
  </AppleCard>

  {/* 数据表格 */}
  <AppleCard className="overflow-hidden p-0">
    <DataTable />
  </AppleCard>

  {/* 分页区 */}
  <div className="flex items-center justify-between">
    <span className="text-sm text-text-secondary">共 {total} 条</span>
    <Pagination />
  </div>
</div>
```

### 5. 分页组件

使用现有的 Pagination 组件：
- 显示总条数
- 页码导航
- 上一页/下一页按钮

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `app/(admin)/layout.tsx` | 修改 | 优化布局结构 |
| `app/(admin)/admin-sidebar.tsx` | 修改 | 优化导航样式 |
| `app/(admin)/user-nav.tsx` | 修改 | 优化用户信息区 |
| `app/(admin)/admin/page.tsx` | 修改 | 仪表盘样式优化 |
| `app/(admin)/admin/blogs/blog-list.tsx` | 修改 | 添加分页 |
| `app/(admin)/admin/categories/category-list.tsx` | 修改 | 添加分页 |
| `app/(admin)/admin/tags/tag-list.tsx` | 修改 | 添加分页 |
| `app/(admin)/admin/users/user-list.tsx` | 修改 | 添加分页 |
| `app/(admin)/admin/changelogs/changelog-list.tsx` | 修改 | 添加分页 |

## 样式规范

### 页面标题

```css
text-3xl font-bold tracking-tight text-text
```

### 卡片容器

```css
rounded-2xl border border-border bg-surface
```

### 按钮

- 主按钮: `bg-accent text-white hover:bg-accent-hover`
- 次要按钮: `border border-border bg-surface hover:bg-surface-hover`
