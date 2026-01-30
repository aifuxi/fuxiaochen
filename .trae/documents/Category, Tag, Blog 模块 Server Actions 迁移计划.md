# Category, Tag, Blog 模块 Server Actions 迁移计划 (接口优先模式)

本计划旨在将现有的 Category, Tag 和 Blog API 迁移到 Server Actions，并采用接口优先（Interface-First）的设计模式。

## 1. 接口定义 (Interface Definitions)

- **创建 `stores/category/interface.ts`**
  - 定义 `ICategoryStore` 接口，包含标准的 CRUD 方法 (`create`, `update`, `delete`, `findById`, `findAll`)。
  - 复用 `types/category.ts` 中的类型。
- **创建 `stores/tag/interface.ts`**
  - 定义 `ITagStore` 接口，包含标准的 CRUD 方法。
  - 复用 `types/tag.ts` 中的类型。
- **创建 `stores/blog/interface.ts`**
  - 定义 `IBlogStore` 接口，包含 CRUD 方法及特殊的查询方法（如 `findBySlug`, `findRelated` 等）。
  - 复用 `types/blog.ts` 中的类型。

## 2. Store 实现 (Store Implementations)

- **创建 `stores/category/store.ts`**
  - 实现 `CategoryStore` 类，对接 Prisma。
  - 实现单例导出 (`stores/category/index.ts`)。
- **创建 `stores/tag/store.ts`**
  - 实现 `TagStore` 类，对接 Prisma。
  - 实现单例导出 (`stores/tag/index.ts`)。
- **创建 `stores/blog/store.ts`**
  - 实现 `BlogStore` 类，对接 Prisma。
  - 处理复杂的关联查询（Category, Tags）和数据转换。
  - 实现单例导出 (`stores/blog/index.ts`)。

## 3. Server Actions 实现 (Server Actions)

- **创建 `app/actions/category.ts`**
  - 实现 `getCategoriesAction`, `createCategoryAction` 等。
- **创建 `app/actions/tag.ts`**
  - 实现 `getTagsAction`, `createTagAction` 等。
- **创建 `app/actions/blog.ts`**
  - 实现 `getBlogsAction`, `getBlogBySlugAction`, `createBlogAction` 等。
- **统一错误处理**：所有 Action 使用统一的 try/catch 块和响应格式。

## 4. 前端组件迁移 (Frontend Migration)

- 查找并替换项目中所有直接调用 `/api/v1/categories`, `/api/v1/tags`, `/api/v1/blogs` 的代码。
- 修改相关组件（如博客列表页、详情页、标签云等）使用新的 Server Actions。

## 5. 清理旧代码 (Cleanup)

- 删除 `app/api/v1/categories` 目录。
- 删除 `app/api/v1/tags` 目录。
- 删除 `app/api/v1/blogs` 目录及 `app/api/v1/public/blogs` 目录。

## 6. 目录结构

```
stores/
  category/
    interface.ts
    store.ts
    index.ts
  tag/
    interface.ts
    store.ts
    index.ts
  blog/
    interface.ts
    store.ts
    index.ts
app/
  actions/
    category.ts
    tag.ts
    blog.ts
```
