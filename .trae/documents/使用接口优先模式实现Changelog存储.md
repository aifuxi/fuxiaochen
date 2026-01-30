# Changelog Server Actions 实施计划

根据您的要求，我将使用 Next.js Server Actions 替换 API 路由，并继续采用接口优先（Interface-First）的设计模式。目前的重点仅限于 **Changelog** 模块。

## 1. 接口定义 (Interface Definition)

- **创建接口文件**: `stores/changelog/interface.ts`
  - 定义 `IChangelogStore` 接口。
  - 包含 CRUD 方法：`create`, `update`, `delete`, `findById`, `findAll`。
  - 使用现有的 `Changelog`, `ChangelogCreateReq` 等类型。

## 2. Store 实现 (Store Implementation)

- **创建实现类**: `stores/changelog/store.ts`
  - 实现 `ChangelogStore` 类，对接 `prisma`。
  - 处理数据转换（BigInt -> number/string）。
  - **单例模式**: 导出 `changelogStore` 实例供 Server Actions 使用。

## 3. Server Actions 实现 (Server Actions)

- **创建 Actions 文件**: `app/actions/changelog.ts`
  - 标记 `'use server'`。
  - 实现以下 Actions：
    - `getChangelogsAction(params: ChangelogListReq)`
    - `getChangelogByIdAction(id: string)`
    - `createChangelogAction(data: ChangelogCreateReq)`
    - `updateChangelogAction(id: string, data: Partial<ChangelogCreateReq>)`
    - `deleteChangelogAction(id: string)`
  - **错误处理**: 使用 `try/catch` 捕获错误，并返回统一的响应格式（`{ success: boolean, data?: any, error?: string }`）。
  - **缓存更新**: 在 Mutation 操作（增删改）后调用 `revalidatePath`。

## 4. 清理旧代码 (Cleanup)

- **删除 API 路由**: 删除 `app/api/v1/changelogs` 目录下的所有文件，完全迁移到 Server Actions。

## 目录结构预览

```
app/
  actions/
    changelog.ts      // Server Actions
stores/
  changelog/
    interface.ts      // 接口定义
    store.ts          // 具体实现
    index.ts          // 导出实例
```
