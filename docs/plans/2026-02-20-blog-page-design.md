# 博客页面设计文档

## 概述

实现博客列表页和博客详情页，支持分类/标签筛选、标题搜索、排序和分页功能。

## 技术方案

**架构**: Server Components + URL SearchParams

**优势**:
- URL 可分享，用户可直接跳转到特定筛选状态
- SEO 友好，每个筛选组合都是独立 URL
- 代码简洁，无需客户端状态管理
- 浏览器前进/后退按钮正常工作

## 文件结构

```
app/(site)/blog/
├── page.tsx                    # 博客列表页（Server Component）
├── [slug]/
│   └── page.tsx                # 博客详情页（Server Component）

components/blog/
├── blog-card.tsx               # 博客卡片组件
├── blog-list.tsx               # 博客列表容器
├── blog-filter-bar.tsx         # 筛选工具栏
├── blog-content.tsx            # Markdown 渲染（已存在）
├── table-of-contents.tsx       # 目录组件（已存在）
└── plugin-*.tsx                # ByteMD 插件（已存在）
```

## 博客列表页

### URL 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| pageSize | number | 10 | 每页数量 |
| title | string | - | 标题模糊搜索 |
| categoryId | string | - | 分类筛选 |
| tagId | string | - | 标签筛选 |
| sortBy | 'createdAt' \| 'updatedAt' | createdAt | 排序字段 |
| order | 'asc' \| 'desc' | desc | 排序方向 |

### 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  博客                                                    │
│  探索技术文章与学习笔记                                    │
├─────────────────────────────────────────────────────────┤
│  [搜索框]  [分类下拉]  [标签下拉]  [排序下拉]              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │ [封面图]  标题                                       ││
│  │          描述...                                     ││
│  │          [分类] [标签1] [标签2]  2024-01-01          ││
│  └─────────────────────────────────────────────────────┘│
│  ...                                                    │
│  [共 50 条]  < 1 2 3 ... 5 >                           │
└─────────────────────────────────────────────────────────┘
```

### 技术要点

- Server Component 直接调用 `getBlogsAction`、`getCategoriesAction`、`getTagsAction`
- 筛选组件使用 `<Link>` 切换 URL 参数
- 分页使用现有 `Pagination` 组件
- 空状态使用 `Empty` 组件

## 博客详情页

### URL 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| slug | string | 博客的唯一标识（SEO 友好） |

### 页面布局

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│     ┌─────────────────────────────────┐  ┌──────────┐  │
│     │         [封面图]                 │  │ 目录      │  │
│     │     文章标题                     │  │ - 标题1   │  │
│     │     2024-01-01 · 分类 · 5分钟   │  │ - 标题2   │  │
│     │     ─────────────────────────   │  │ - 标题3   │  │
│     │     Markdown 内容...            │  │          │  │
│     │     [标签1] [标签2] [标签3]      │  │          │  │
│     └─────────────────────────────────┘  └──────────┘  │
│     ← 返回博客列表                                       │
└─────────────────────────────────────────────────────────┘
```

### 技术要点

- 使用 `getBlogBySlugAction` 获取数据
- 内容区使用 `BlogContent` 组件渲染 Markdown
- 目录使用 `TableOfContents` 组件
- 使用 `generateMetadata` 生成 SEO 元数据
- 404 处理：博客不存在时调用 `notFound()`

### 响应式设计

- **桌面端**: 内容区约 720px，右侧目录约 240px
- **移动端**: 隐藏右侧目录

## 组件设计

### BlogFilterBar

筛选工具栏组件。

```typescript
interface BlogFilterBarProps {
  categories: Category[];
  tags: Tag[];
  currentFilters: {
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
  };
}
```

**UI 结构**:
- 搜索框：输入后按回车或点击搜索按钮触发
- 分类选择器：下拉单选，包含"全部分类"选项
- 标签选择器：下拉单选，包含"全部标签"选项
- 排序选择器：下拉选择，选项如"最新发布"、"最近更新"

### BlogCard

博客卡片组件。

```typescript
interface BlogCardProps {
  blog: Blog;
}
```

**UI 结构**:
- 左侧：封面图（16:9 比例）
- 右侧：标题、描述（截断 2 行）、分类 Badge、标签 Badges、发布时间

### BlogList

博客列表容器组件。

```typescript
interface BlogListProps {
  blogs: Blog[];
  total: number;
  currentPage: number;
  pageSize: number;
}
```

**职责**:
- 渲染 BlogCard 列表
- 底部渲染 Pagination 组件
- 空状态处理

## Store 修改

`stores/blog/store.ts` 的 `findAll` 方法需要添加 `sortBy` 和 `order` 参数支持：

```typescript
async findAll(params?: BlogListReq): Promise<BlogListResp> {
  const {
    page = 1,
    pageSize = 10,
    title,
    categoryId,
    tagId,
    published,
    sortBy = 'createdAt',
    order = 'desc',
  } = params || {};

  // ... where 条件 ...

  const orderBy = { [sortBy]: order };

  const [total, list] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      // ...
    }),
  ]);
}
```

## 数据流

```
URL SearchParams
    ↓
Server Component (page.tsx)
    ↓
Server Actions (getBlogsAction, getBlogBySlugAction, etc.)
    ↓
Store (BlogStore.findAll, BlogStore.findBySlug)
    ↓
Prisma ORM
    ↓
MySQL/MariaDB
```

## 复用组件

| 组件 | 路径 | 用途 |
|------|------|------|
| BlogContent | `components/blog/blog-content.tsx` | Markdown 渲染 |
| TableOfContents | `components/blog/table-of-contents.tsx` | 目录导航 |
| Pagination | `components/ui/pagination.tsx` | 分页 |
| Card | `components/ui/card.tsx` | 卡片容器 |
| Badge | `components/ui/badge.tsx` | 分类/标签徽章 |
| Input | `components/ui/input.tsx` | 搜索输入框 |
| Select | `components/ui/select.tsx` | 下拉选择器 |
| Empty | `components/ui/empty.tsx` | 空状态 |

## 设计规范

所有组件遵循 Apple Human Interface Guidelines：
- 圆角：`rounded-lg` (12px) 用于按钮/输入框，`rounded-xl` (20px) 用于卡片
- 颜色：使用语义化 CSS 变量（`bg-surface`, `text-text`, `border-border`）
- 阴影：`shadow-sm` 用于卡片
- 过渡：`duration-200` + `ease-apple`
