"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsFeedbackPanel } from "@/components/cms/cms-feedback-panel";
import { CmsListShell } from "@/components/cms/cms-list-shell";
import { CmsMetricStrip } from "@/components/cms/cms-metric-strip";
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";
import { CategoryDeleteDialog } from "@/components/modals/category-delete-dialog";
import { CategoryFormDialog } from "@/components/modals/category-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  createCategory,
  deleteCategory,
  listCategories,
  type ListCategoriesResult,
  type CategoryApiError,
  updateCategory,
} from "@/lib/category/category-client";
import type { CategoryDto, CreateCategoryInput, UpdateCategoryInput } from "@/lib/category/category-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;

export function CmsCategoryManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const query = React.useMemo(
    () => ({
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [keyword, page],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListCategoriesResult, CategoryApiError>(
    ["categories", query.keyword ?? "", query.page, query.pageSize],
    () => listCategories(query),
    {
      keepPreviousData: true,
    },
  );

  const createMutation = useSWRMutation("create-category", (_key, { arg }: { arg: CreateCategoryInput }) =>
    createCategory(arg),
  );
  const updateMutation = useSWRMutation(
    "update-category",
    (_key, { arg }: { arg: { id: string; input: UpdateCategoryInput } }) => updateCategory(arg.id, arg.input),
  );
  const deleteMutation = useSWRMutation(
    "delete-category",
    (_key, { arg }: { arg: { id: string } }) => deleteCategory(arg.id),
  );

  const categories = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);
  const isMutating = createMutation.isMutating || updateMutation.isMutating || deleteMutation.isMutating;

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleCreate(input: CreateCategoryInput) {
    await createMutation.trigger(input);
    toast.success("分类创建成功。");
    await mutate();
  }

  async function handleUpdate(id: string, input: CreateCategoryInput) {
    await updateMutation.trigger({
      id,
      input,
    });
    toast.success("分类更新成功。");
    await mutate();
  }

  async function handleDelete(category: CategoryDto) {
    await deleteMutation.trigger({
      id: category.id,
    });
    toast.success(`已删除 ${category.name}。`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openCreateDialog() {
    void NiceModal.show(CategoryFormDialog, {
      mode: "create",
      onSubmit: handleCreate,
    });
  }

  function openDeleteDialog(category: CategoryDto) {
    void NiceModal.show(CategoryDeleteDialog, {
      category,
      onConfirm: () => handleDelete(category),
    });
  }

  function openEditDialog(category: CategoryDto) {
    void NiceModal.show(CategoryFormDialog, {
      category,
      mode: "edit",
      onSubmit: (input) => handleUpdate(category.id, input),
    });
  }

  return (
    <CmsListShell
      filters={(
        <div className={`
          flex flex-col gap-4
          lg:flex-row lg:items-center lg:justify-between
        `}>
          <div className={`
            flex flex-1 flex-col gap-3
            sm:flex-row sm:items-center
          `}>
            <div className="w-full max-w-md">
              <Input
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="按分类名称、slug 或描述搜索"
                startAdornment={<Search className="size-4" />}
                value={searchValue}
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Badge variant="muted">{total} 个分类</Badge>
              {isValidating && !isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="size-3 animate-spin" /> 刷新中
                </span>
              ) : null}
            </div>
          </div>

          <Button disabled={isMutating} onClick={openCreateDialog} variant="primary">
            <Plus className="size-4" />
            添加分类
          </Button>
        </div>
      )}
      metrics={(
        <CmsMetricStrip
          items={[
            { label: "分类总数", value: String(total) },
            { label: "可见分类", value: String(categories.length) },
            { label: "当前搜索", value: keyword ? keyword : "全部分类" },
          ]}
        />
      )}
      body={(
        <CmsSectionPanel
          description="管理文章分类层级、展示色和使用情况。"
          title="分类列表"
        >
          <div className="space-y-6">
            <Table>
              <TableRoot>
                <TableHead>
                  <tr>
                    <TableHeaderCell>分类</TableHeaderCell>
                    <TableHeaderCell>Slug</TableHeaderCell>
                    <TableHeaderCell>使用量</TableHeaderCell>
                    <TableHeaderCell>排序</TableHeaderCell>
                    <TableHeaderCell>更新时间</TableHeaderCell>
                    <TableHeaderCell className="text-right">操作</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <div className="h-14 animate-pulse rounded-xl bg-white/5" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell className="py-6" colSpan={6}>
                        <CmsFeedbackPanel
                          action={(
                            <Button onClick={() => void mutate()} variant="outline">
                              重试
                            </Button>
                          )}
                          description={error.message || "加载分类失败。"}
                          title="分类加载失败"
                        />
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-6" colSpan={6}>
                        <CmsEmptyState
                          action={!keyword ? (
                            <Button onClick={openCreateDialog} variant="outline">
                              <Plus className="size-4" />
                              创建分类
                            </Button>
                          ) : undefined}
                          description={
                            keyword
                              ? "尝试不同的关键词或清除搜索。"
                              : "创建第一个分类来组织顶级文章板块。"
                          }
                          title={keyword ? "没有符合搜索条件的分类。" : "暂无分类。"}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span
                                className="inline-block size-3 rounded-full border border-white/10"
                                style={{ backgroundColor: category.color ?? "#27272A" }}
                              />
                              <span className="font-medium text-foreground">{category.name}</span>
                            </div>
                            <div className="line-clamp-2 text-xs leading-5 text-muted">
                              {category.description || "暂无描述"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded-md bg-white/6 px-2 py-1 text-xs text-emerald-200">{category.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.usageCount > 0 ? "primary" : "muted"}>
                            {category.usageCount} 篇文章
                          </Badge>
                        </TableCell>
                        <TableCell>{category.sortOrder}</TableCell>
                        <TableCell className="text-muted">
                          {format(new Date(category.updatedAt), "yyyy-MM-dd HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button disabled={isMutating} onClick={() => openEditDialog(category)} size="sm" variant="ghost">
                              <Pencil className="size-4" />
                              编辑
                            </Button>
                            <Button
                              disabled={isMutating}
                              onClick={() => openDeleteDialog(category)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 className="size-4" />
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </Table>

            <div className={`
              flex flex-col gap-4
              sm:flex-row sm:items-center sm:justify-between
            `}>
              <p className="text-sm text-muted">
                {total === 0
                  ? "无记录"
                  : `显示 ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)}，共 ${total} 条`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                  size="sm"
                  variant="outline"
                >
                  上一页
                </Button>
                {visiblePages.map((item) => (
                  <Button
                    key={item}
                    disabled={isLoading}
                    onClick={() => setPage(item)}
                    size="sm"
                    variant={item === page ? "primary" : "ghost"}
                  >
                    {item}
                  </Button>
                ))}
                <Button
                  disabled={page === totalPages || isLoading}
                  onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
                  size="sm"
                  variant="outline"
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        </CmsSectionPanel>
      )}
    />
  );
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
