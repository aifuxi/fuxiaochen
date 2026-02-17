# 后台列表页面 Data-Table 重构设计

## 概述

使用 `components/ui/data-table` 组件（基于 TanStack React Table）重构所有后台管理列表页面，统一表格实现，提升代码复用性和维护性。

## 重构范围

5 个后台列表页面：
- `app/(admin)/admin/blogs/blog-list.tsx`
- `app/(admin)/admin/categories/category-list.tsx`
- `app/(admin)/admin/tags/tag-list.tsx`
- `app/(admin)/admin/users/user-list.tsx`
- `app/(admin)/admin/changelogs/changelog-list.tsx`

## 功能需求

| 页面 | 搜索 | 筛选 | 排序 | 分页 |
|------|------|------|------|------|
| blogs | 标题模糊搜索 | 分类（单选）、标签（多选） | 创建时间、更新时间 | ✓ |
| categories | 名称 | - | 创建时间、更新时间 | ✓ |
| tags | 名称 | - | 创建时间、更新时间 | ✓ |
| users | 用户名 | - | 创建时间、更新时间 | ✓ |
| changelogs | 版本号 | - | 创建时间、更新时间 | ✓ |

## 操作列设计

### 固定方式
使用 TanStack Table 的 `columnPinning` 功能将操作列固定在最右侧。

### 按钮样式
- 使用图标按钮：`Pencil`（编辑）、`Trash`（删除）
- 按钮样式：`variant="ghost" size="icon"`
- 符合 Apple Human Interface Guidelines

### 列定义模式
```tsx
const columns: ColumnDef<T>[] = [
  // 数据列...
  {
    id: "actions",
    enablePinning: true,
    meta: { pinning: "right" },
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]
```

## 搜索/筛选区域设计

### 通用布局
```
[搜索框] [筛选器（如需要）]              [新增按钮]
```

### blogs 页面筛选器
- **分类筛选**：使用 Select 下拉选择器，选项从分类列表 API 获取
- **标签筛选**：使用带复选框的 Popover/DropdownMenu，支持多选，显示已选数量

## 排序实现

使用 `data-table-column-header` 组件实现表头排序，所有页面统一支持：
- `createdAt` - 创建时间（默认降序）
- `updatedAt` - 更新时间

## 实现方案

采用方案 A：直接重构各页面，每个页面独立定义 columns 配置。

**优点**：
- 每个页面独立，灵活性高
- 修改单个页面不影响其他页面
- 符合现有项目结构

## 注意事项

1. 保持现有的 NiceModal 弹窗管理方式
2. 保持现有的 useSWR 数据获取方式
3. 保持现有的 URLSearchParams 查询参数管理
4. 操作列需要设置合适的列宽，避免挤压
5. 固定列需要设置背景色，避免滚动时内容穿透
