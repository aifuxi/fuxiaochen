"use client";

import NiceModal from "@ebay/nice-modal-react";
import { FriendLinkStatus } from "@/generated/prisma/enums";
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
import { FriendLinkDeleteDialog } from "@/components/modals/friend-link-delete-dialog";
import { FriendLinkFormDialog } from "@/components/modals/friend-link-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  createFriendLink,
  deleteFriendLink,
  type FriendLinkApiError,
  listFriendLinks,
  type ListFriendLinksResult,
  updateFriendLink,
} from "@/lib/friend-link/friend-link-client";
import type { CreateFriendLinkInput, FriendLinkDto, UpdateFriendLinkInput } from "@/lib/friend-link/friend-link-dto";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;
const STATUS_FILTER_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "已批准", value: FriendLinkStatus.Approved },
  { label: "待审核", value: FriendLinkStatus.Pending },
  { label: "已下线", value: FriendLinkStatus.Offline },
  { label: "已拒绝", value: FriendLinkStatus.Rejected },
];

export function CmsFriendLinkManager() {
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [status, setStatus] = React.useState<FriendLinkStatus | "">("");

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
      status: status || undefined,
    }),
    [keyword, page, status],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListFriendLinksResult, FriendLinkApiError>(
    ["friend-links", query.keyword ?? "", query.status ?? "", query.page, query.pageSize],
    () => listFriendLinks(query),
    {
      keepPreviousData: true,
    },
  );

  const createMutation = useSWRMutation(
    "create-friend-link",
    (_key, { arg }: { arg: CreateFriendLinkInput }) => createFriendLink(arg),
  );
  const updateMutation = useSWRMutation(
    "update-friend-link",
    (_key, { arg }: { arg: { id: string; input: UpdateFriendLinkInput } }) => updateFriendLink(arg.id, arg.input),
  );
  const deleteMutation = useSWRMutation(
    "delete-friend-link",
    (_key, { arg }: { arg: { id: string } }) => deleteFriendLink(arg.id),
  );

  const friendLinks = data?.items ?? [];
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

  async function handleCreate(input: CreateFriendLinkInput) {
    await createMutation.trigger(input);
    toast.success("友链创建成功。");
    await mutate();
  }

  async function handleUpdate(id: string, input: CreateFriendLinkInput) {
    await updateMutation.trigger({
      id,
      input,
    });
    toast.success("友链更新成功。");
    await mutate();
  }

  async function handleDelete(friendLink: FriendLinkDto) {
    await deleteMutation.trigger({
      id: friendLink.id,
    });
    toast.success(`已删除 ${friendLink.siteName}。`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openCreateDialog() {
    void NiceModal.show(FriendLinkFormDialog, {
      mode: "create",
      onSubmit: handleCreate,
    });
  }

  function openDeleteDialog(friendLink: FriendLinkDto) {
    void NiceModal.show(FriendLinkDeleteDialog, {
      friendLink,
      onConfirm: () => handleDelete(friendLink),
    });
  }

  function openEditDialog(friendLink: FriendLinkDto) {
    void NiceModal.show(FriendLinkFormDialog, {
      friendLink,
      mode: "edit",
      onSubmit: (input) => handleUpdate(friendLink.id, input),
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
          lg:flex-row lg:items-center
        `}>
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="按网站名称、URL、域名或描述搜索"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setStatus(value as FriendLinkStatus | "");
                setPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
              value={status}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} 个链接</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> 刷新中</span> : null}
          </div>
        </div>

        <Button disabled={isMutating} onClick={openCreateDialog} variant="primary">
          <Plus className="size-4" />
          添加友链
        </Button>
      </div>
      )}
      metrics={(
        <CmsMetricStrip
          items={[
            { label: "链接总数", value: String(total) },
            { label: "可见链接", value: String(friendLinks.length) },
            { label: "当前筛选", value: status || (keyword ? `#${keyword}` : "全部链接") },
          ]}
        />
      )}
      body={(
        <CmsSectionPanel
          description="集中维护友链状态、排序和站点资料。"
          title="友链列表"
        >
          <div className="space-y-6">
      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>网站</TableHeaderCell>
              <TableHeaderCell>域名</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
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
                    description={error.message || "加载友链失败。"}
                    title="友链加载失败"
                  />
                </TableCell>
              </TableRow>
            ) : friendLinks.length === 0 ? (
              <TableRow>
                <TableCell className="py-6" colSpan={6}>
                  <CmsEmptyState
                    action={!keyword && !status ? (
                      <Button onClick={openCreateDialog} variant="outline">
                        <Plus className="size-4" />
                        创建友链
                      </Button>
                    ) : undefined}
                    description={
                      keyword || status
                        ? "尝试不同的关键词或状态。"
                        : "创建第一个友链来填充目录。"
                    }
                    title={keyword || status ? "没有符合筛选条件的友链。" : "暂无友链。"}
                  />
                </TableCell>
              </TableRow>
            ) : (
              friendLinks.map((friendLink) => (
                <TableRow key={friendLink.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{friendLink.siteName}</div>
                      <div className="text-xs text-muted">
                        {friendLink.subtitle || friendLink.siteUrl}
                      </div>
                      <div className="line-clamp-2 text-xs leading-5 text-muted">
                        {friendLink.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded-md bg-white/6 px-2 py-1 text-xs text-emerald-200">
                      {friendLink.domain || new URL(friendLink.siteUrl).host}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(friendLink.status)}>
                      {formatStatusLabel(friendLink.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{friendLink.sortOrder}</TableCell>
                  <TableCell className="text-muted">{format(new Date(friendLink.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button disabled={isMutating} onClick={() => openEditDialog(friendLink)} size="sm" variant="ghost">
                        <Pencil className="size-4" />
                        编辑
                      </Button>
                      <Button
                        disabled={isMutating}
                        onClick={() => openDeleteDialog(friendLink)}
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

function getStatusBadgeVariant(status: FriendLinkStatus) {
  switch (status) {
    case FriendLinkStatus.Approved:
      return "success";
    case FriendLinkStatus.Offline:
      return "warning";
    case FriendLinkStatus.Rejected:
      return "destructive";
    case FriendLinkStatus.Pending:
    default:
      return "info";
  }
}

function formatStatusLabel(status: FriendLinkStatus) {
  switch (status) {
    case FriendLinkStatus.Approved:
      return "已批准";
    case FriendLinkStatus.Offline:
      return "已下线";
    case FriendLinkStatus.Rejected:
      return "已拒绝";
    case FriendLinkStatus.Pending:
    default:
      return "待审核";
  }
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
