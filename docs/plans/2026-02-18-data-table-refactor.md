# 后台列表页面 Data-Table 重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 使用 TanStack React Table 的 data-table 组件重构所有后台管理列表页面，统一操作列固定在右侧。

**Architecture:** 增强现有 data-table 组件支持 columnPinning 功能，然后逐个重构 5 个列表页面。每个页面独立定义 columns 配置，使用 TanStack 的列固定功能将操作列固定在最右侧。

**Tech Stack:** TanStack React Table, React, TypeScript, Tailwind CSS

---

## Task 1: 增强 table.tsx 基础组件支持固定列

**Files:**
- Modify: `components/ui/table.tsx`

**Step 1: 为 TableHead 和 TableCell 添加固定列样式支持**

在 `TableHead` 组件中添加固定列支持：

```tsx
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        `
          h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-text-secondary
          [&:has([role=checkbox])]:pr-0
          [&>[role=checkbox]]:translate-y-[2px]
          sticky bg-surface
          [&[data-pinned=left]]:left-0
          [&[data-pinned=right]]:right-0
          [&[data-pinned=right]]:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]
        `,
        className,
      )}
      {...props}
    />
  );
}
```

在 `TableCell` 组件中添加固定列支持：

```tsx
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        `
          p-2 align-middle whitespace-nowrap
          [&:has([role=checkbox])]:pr-0
          [&>[role=checkbox]]:translate-y-[2px]
          sticky bg-surface
          [&[data-pinned=left]]:left-0
          [&[data-pinned=right]]:right-0
          [&[data-pinned=right]]:shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]
        `,
        className,
      )}
      {...props}
    />
  );
}
```

**Step 2: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 3: Commit**

```bash
git add components/ui/table.tsx
git commit -m "feat(table): 添加固定列样式支持"
```

---

## Task 2: 增强 data-table.tsx 支持 columnPinning

**Files:**
- Modify: `components/ui/data-table.tsx`

**Step 1: 添加 columnPinning 状态和配置**

修改 `data-table.tsx`，添加列固定支持：

```tsx
"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ColumnPinningState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyText?: string;
  containerClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showPagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  emptyText = "暂无数据",
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: [],
    right: ["actions"],
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    initialState: {
      pagination: {
        pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnPinning,
    },
  });

  return (
    <div className={containerClassName}>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  return (
                    <TableHead
                      key={header.id}
                      data-pinned={isPinned || undefined}
                      className={isPinned ? "z-10" : ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : (typeof header.column.columnDef.header === "function"
                            ? header.column.columnDef.header(header.getContext())
                            : header.column.columnDef.header) as React.ReactNode}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    return (
                      <TableCell
                        key={cell.id}
                        data-pinned={isPinned || undefined}
                        className={isPinned ? "z-10" : ""}
                      >
                        {typeof cell.column.columnDef.cell === "function"
                          ? cell.column.columnDef.cell(cell.getContext())
                          : cell.column.columnDef.cell as React.ReactNode}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-text-secondary"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

export type { ColumnDef, Row, Table as TableType } from "@tanstack/react-table";
```

**Step 2: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 3: Commit**

```bash
git add components/ui/data-table.tsx
git commit -m "feat(data-table): 添加 columnPinning 支持"
```

---

## Task 3: 重构 categories 列表页面（最简单，作为模板）

**Files:**
- Modify: `app/(admin)/admin/categories/category-list.tsx`

**Step 1: 重构 category-list.tsx**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NiceModal from "@ebay/nice-modal-react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import useSWR from "swr";
import type { ColumnDef } from "@tanstack/react-table";
import { getCategoriesAction } from "@/app/actions/category";
import { type Category, type CategoryListReq } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppleCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatSimpleDateWithTime } from "@/lib/time";
import { CategoryDialog } from "./category-dialog";
import { DeleteAlert } from "./delete-alert";

const fetcher = async (params: CategoryListReq) => {
  const res = await getCategoriesAction(params);
  if (!res.success) throw new Error(res.error);
  return res.data;
};

interface CategoryListProps {
  mutate: () => void;
}

function CategoryTable({ mutate }: CategoryListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;
  const sortBy = (searchParams.get("sortBy") as "createdAt" | "updatedAt") || "createdAt";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";

  const { data, isLoading } = useSWR(
    { page, pageSize, name, sortBy, order },
    fetcher,
  );

  const handleSort = (field: "createdAt" | "updatedAt") => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sortBy");
    const currentOrder = params.get("order");

    if (currentSort === field) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("order", "desc");
    }
    router.push(`?${params.toString()}`);
  };

  const openEdit = (category: Category) => {
    NiceModal.show(CategoryDialog, {
      category,
      onSuccess: () => mutate(),
    });
  };

  const openDelete = (id: string) => {
    NiceModal.show(DeleteAlert, {
      id,
      onSuccess: () => mutate(),
    });
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => (
        <span className="font-medium text-text">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-accent text-accent">
          {row.original.slug}
        </Badge>
      ),
    },
    {
      accessorKey: "blogCount",
      header: "文章数",
      cell: ({ row }) => row.original.blogCount,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="创建时间"
        />
      ),
      cell: ({ row }) => formatSimpleDateWithTime(new Date(row.original.createdAt)),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="更新时间"
        />
      ),
      cell: ({ row }) => formatSimpleDateWithTime(new Date(row.original.updatedAt)),
    },
    {
      id: "actions",
      enablePinning: true,
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDelete(row.original.id)}
            className="hover:bg-error/10 hover:text-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="py-8 text-center text-text-secondary">加载中...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data?.lists || []}
      showPagination={false}
      emptyText="暂无分类"
    />
  );
}

export default function CategoryManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;
  const name = searchParams.get("name") || undefined;
  const sortBy = (searchParams.get("sortBy") as "createdAt" | "updatedAt") || "createdAt";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";

  const { data, mutate } = useSWR(
    { page, pageSize, name, sortBy, order },
    fetcher,
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query") as string;

    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("name", query);
    } else {
      params.delete("name");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const showCategoryModal = (category?: Category) => {
    NiceModal.show(CategoryDialog, {
      category,
      onSuccess: () => mutate(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text">分类管理</h2>
        <p className="text-text-secondary">管理博客文章的分类体系</p>
      </div>

      <AppleCard className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-text-secondary" />
            <Input
              name="query"
              placeholder="搜索分类..."
              defaultValue={name || ""}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
        <Button onClick={() => showCategoryModal()} className="bg-accent text-white hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          新增分类
        </Button>
      </AppleCard>

      <AppleCard className="overflow-hidden p-0">
        <CategoryTable mutate={() => mutate()} />
      </AppleCard>

      {data && (
        <div className="flex justify-center text-sm text-text-secondary">
          共 {data.total} 条数据
        </div>
      )}
    </div>
  );
}
```

**Step 2: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/categories/category-list.tsx
git commit -m "refactor(categories): 使用 data-table 组件重构列表页面"
```

---

## Task 4: 重构 tags 列表页面

**Files:**
- Modify: `app/(admin)/admin/tags/tag-list.tsx`

**Step 1: 重构 tag-list.tsx**

参考 Task 3 的模式，将 tag-list.tsx 重构为使用 DataTable 组件，包含：
- 名称、Slug、文章数列
- 创建时间、更新时间（支持排序）
- 操作列（编辑、删除）

**Step 2: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/tags/tag-list.tsx
git commit -m "refactor(tags): 使用 data-table 组件重构列表页面"
```

---

## Task 5: 重构 users 列表页面

**Files:**
- Modify: `app/(admin)/admin/users/user-list.tsx`

**Step 1: 重构 user-list.tsx**

参考 Task 3 的模式，将 user-list.tsx 重构为使用 DataTable 组件，包含：
- 用户（头像+名称）、邮箱、角色列
- 创建时间、更新时间（支持排序）
- 操作列（编辑、删除）

**Step 2: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/users/user-list.tsx
git commit -m "refactor(users): 使用 data-table 组件重构列表页面"
```

---

## Task 6: 重构 changelogs 列表页面

**Files:**
- Modify: `app/(admin)/admin/changelogs/changelog-list.tsx`

**Step 1: 重构 changelog-list.tsx**

参考 Task 3 的模式，将 changelog-list.tsx 重构为使用 DataTable 组件，包含：
- 版本、发布日期、内容预览列
- 创建时间、更新时间（支持排序）
- 操作列（编辑、删除）

**Step 2: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/changelogs/changelog-list.tsx
git commit -m "refactor(changelogs): 使用 data-table 组件重构列表页面"
```

---

## Task 7: 重构 blogs 列表页面（最复杂，含筛选功能）

**Files:**
- Modify: `app/(admin)/admin/blogs/blog-list.tsx`
- Modify: `types/blog.ts` - 添加 tagIds 参数支持多选

**Step 1: 扩展 BlogListReq 类型**

在 `types/blog.ts` 中添加：

```ts
export interface BlogListReq extends ListReq {
  title?: string;
  slug?: string;
  categoryId?: string;
  tagIds?: string[];  // 支持多选标签
  blogIDs?: string[];
  published?: boolean;
}
```

**Step 2: 重构 blog-list.tsx**

重构为使用 DataTable 组件，包含：
- 标题、分类、标签、发布状态列
- 创建时间、更新时间（支持排序）
- 操作列（编辑、删除）
- 筛选区域：标题搜索、分类单选、标签多选

标签多选使用带复选框的 Popover 实现。

**Step 3: 验证修改**

Run: `pnpm lint`
Expected: 无错误

**Step 4: Commit**

```bash
git add app/\(admin\)/admin/blogs/blog-list.tsx types/blog.ts
git commit -m "refactor(blogs): 使用 data-table 组件重构列表页面，添加分类和标签筛选"
```

---

## Task 8: 验证所有页面功能

**Step 1: 启动开发服务器**

Run: `pnpm dev`

**Step 2: 逐个测试页面**

访问以下页面验证功能：
1. `/admin/categories` - 搜索、排序、编辑、删除
2. `/admin/tags` - 搜索、排序、编辑、删除
3. `/admin/users` - 搜索、排序、编辑、删除
4. `/admin/changelogs` - 搜索、排序、编辑、删除
5. `/admin/blogs` - 搜索、分类筛选、标签筛选、排序、编辑、删除

**Step 3: 验证操作列固定**

在表格水平滚动时，确认操作列始终固定在最右侧。

**Step 4: 最终提交**

```bash
git add .
git commit -m "feat: 完成后台列表页面 data-table 重构"
```

---

## 注意事项

1. 保持 NiceModal 弹窗管理方式不变
2. 保持 useSWR 数据获取方式不变
3. 保持 URLSearchParams 查询参数管理不变
4. 操作列宽度固定，避免挤压
5. 固定列需要设置背景色（bg-surface）和阴影效果
