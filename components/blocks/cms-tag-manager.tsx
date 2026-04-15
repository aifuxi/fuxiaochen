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
import { TagDeleteDialog } from "@/components/modals/tag-delete-dialog";
import { TagFormDialog } from "@/components/modals/tag-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  createTag,
  deleteTag,
  listTags,
  type TagApiError,
  updateTag,
  type ListTagsResult,
} from "@/lib/tag/tag-client";
import type { CreateTagInput, TagDto, UpdateTagInput } from "@/lib/tag/tag-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;

export function CmsTagManager() {
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

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListTagsResult, TagApiError>(
    ["tags", query.keyword ?? "", query.page, query.pageSize],
    () => listTags(query),
    {
      keepPreviousData: true,
    },
  );

  const createMutation = useSWRMutation("create-tag", (_key, { arg }: { arg: CreateTagInput }) => createTag(arg));
  const updateMutation = useSWRMutation(
    "update-tag",
    (_key, { arg }: { arg: { id: string; input: UpdateTagInput } }) => updateTag(arg.id, arg.input),
  );
  const deleteMutation = useSWRMutation("delete-tag", (_key, { arg }: { arg: { id: string } }) => deleteTag(arg.id));

  const tags = data?.items ?? [];
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

  async function handleCreate(input: CreateTagInput) {
    await createMutation.trigger(input);
    toast.success("标签创建成功。");
    await mutate();
  }

  async function handleUpdate(id: string, input: CreateTagInput) {
    await updateMutation.trigger({
      id,
      input,
    });
    toast.success("标签更新成功。");
    await mutate();
  }

  async function handleDelete(tag: TagDto) {
    await deleteMutation.trigger({
      id: tag.id,
    });
    toast.success(`已删除 #${tag.name}。`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openCreateDialog() {
    void NiceModal.show(TagFormDialog, {
      mode: "create",
      onSubmit: handleCreate,
    });
  }

  function openDeleteDialog(tag: TagDto) {
    void NiceModal.show(TagDeleteDialog, {
      onConfirm: () => handleDelete(tag),
      tag,
    });
  }

  function openEditDialog(tag: TagDto) {
    void NiceModal.show(TagFormDialog, {
      mode: "edit",
      onSubmit: (input) => handleUpdate(tag.id, input),
      tag,
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
                placeholder="按标签名称、slug 或描述搜索"
                startAdornment={<Search className="size-4" />}
                value={searchValue}
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Badge variant="muted">{total} 个标签</Badge>
              {isValidating && !isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="size-3 animate-spin" /> 刷新中
                </span>
              ) : null}
            </div>
          </div>

          <Button disabled={isMutating} onClick={openCreateDialog} variant="primary">
            <Plus className="size-4" />
            添加标签
          </Button>
        </div>
      )}
      metrics={(
        <CmsMetricStrip
          items={[
            { label: "标签总数", value: String(total) },
            { label: "可见标签", value: String(tags.length) },
            { label: "当前搜索", value: keyword ? `#${keyword}` : "全部标签" },
          ]}
        />
      )}
      body={(
        <CmsSectionPanel
          description="管理标签命名、排序和内容覆盖范围。"
          title="标签列表"
        >
          <div className="space-y-6">
            <Table>
              <TableRoot>
                <TableHead>
                  <tr>
                    <TableHeaderCell>名称</TableHeaderCell>
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
                          description={error.message || "加载标签失败。"}
                          title="标签加载失败"
                        />
                      </TableCell>
                    </TableRow>
                  ) : tags.length === 0 ? (
                    <TableRow>
                      <TableCell className="py-6" colSpan={6}>
                        <CmsEmptyState
                          action={!keyword ? (
                            <Button onClick={openCreateDialog} variant="outline">
                              <Plus className="size-4" />
                              创建标签
                            </Button>
                          ) : undefined}
                          description={
                            keyword ? "尝试不同的关键词或清除搜索。" : "创建第一个标签来组织文章主题。"
                          }
                          title={keyword ? "没有符合搜索条件的标签。" : "暂无标签。"}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">#{tag.name}</div>
                            <div className="line-clamp-2 text-xs leading-5 text-muted">
                              {tag.description || "暂无描述"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded-md bg-white/6 px-2 py-1 text-xs text-emerald-200">{tag.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tag.usageCount > 0 ? "primary" : "muted"}>
                            {tag.usageCount} 篇文章
                          </Badge>
                        </TableCell>
                        <TableCell>{tag.sortOrder}</TableCell>
                        <TableCell className="text-muted">{format(new Date(tag.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button disabled={isMutating} onClick={() => openEditDialog(tag)} size="sm" variant="ghost">
                              <Pencil className="size-4" />
                              编辑
                            </Button>
                            <Button disabled={isMutating} onClick={() => openDeleteDialog(tag)} size="sm" variant="outline">
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
