"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import type { PostItem } from "@/lib/posts/schema";

import { Button } from "@/components/ui/button";
import { DataTable, getDataTableSort, useDataTableState } from "@/components/ui/data-table";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { postStatusLabels, postTime, type PostStatus } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { AdminRowActionsCell } from "./admin-table";
import { PostQueryStatus } from "./post-status";
import { useDebouncedPostQuery, usePostList, usePostClock } from "./use-posts";
import "./admin-data-workspace.css";
import "./admin-posts.css";

const filters: { value: "all" | PostStatus; label: string }[] = [
  { value: "all", label: "全部文章" },
  { value: "published", label: "已发布" },
  { value: "draft", label: "草稿箱" },
  { value: "scheduled", label: "发布计划" },
];

const actionIcons = { Pencil: <Pencil size={16} />, Trash2: <Trash2 size={16} /> };

const columns: ColumnDef<PostItem>[] = [
  {
    id: "title",
    header: "文章标题",
    accessorKey: "title",
    enableSorting: true,
    cell: ({ row, table }) => {
      const post = row.original;
      return (
        <>
          <button
            type="button"
            className="admin-post-title"
            disabled={table.options.meta?.disableActions}
            onClick={() => table.options.meta?.editRow?.(post)}
          >
            {post.title}
          </button>
          <div className="admin-post-tags">
            {post.tags.map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </div>
        </>
      );
    },
  },
  {
    id: "category",
    header: "分类",
    accessorKey: "category",
    enableSorting: true,
    cell: ({ row }) => {
      const post = row.original;
      return (
        <>
          <span className="admin-post-category">{post.category.name}</span>
        </>
      );
    },
  },
  {
    id: "status",
    header: "状态",
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }) => {
      const post = row.original;
      return (
        <>
          <span
            className={`admin-post-status ${post.status === "published" ? "is-published" : post.status === "scheduled" ? "is-scheduled" : ""}`}
          >
            {postStatusLabels[post.status]}
          </span>
        </>
      );
    },
  },
  {
    id: "views",
    header: "浏览量",
    enableSorting: false,
    meta: { className: "admin-post-metric" },
    cell: ({ row }) => {
      const post = row.original;
      return <>{post.status === "published" ? "尚未接入" : "—"}</>;
    },
  },
  {
    id: "time",
    header: "时间",
    accessorKey: "time",
    enableSorting: true,
    meta: { className: "admin-post-metric" },
    cell: ({ row, table }) => {
      const post = row.original;
      const now = table.options.meta?.postClock ?? null;
      return (
        <>
          {postTime(
            post.status === "scheduled" ? post.scheduledFor : (post.publishedAt ?? post.updatedAt),
            post.status !== "scheduled",
          )}
          {post.status === "scheduled" &&
            post.scheduledFor &&
            now !== null &&
            Date.parse(post.scheduledFor) <= now && <span> · 已过期</span>}
        </>
      );
    },
  },
  { id: "actions", header: "操作", cell: AdminRowActionsCell },
];

export function AdminPosts() {
  const now = usePostClock();
  const { categoryItems, postRevision, postPending, onOpen, onEdit, onDeletePost } =
    useAdminWorkspace();
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const tableState = useDataTableState();
  const { page, setPage, sorting, pagination } = tableState;
  const pageSize = pagination.pageSize;
  const searchRef = useRef<HTMLInputElement>(null);
  const term = useDebouncedPostQuery(query);
  const result = usePostList(
    {
      status,
      categoryId: category,
      q: term,
      page,
      pageSize,
      ...getDataTableSort(sorting, ["title", "category", "status", "time"] as const),
    },
    postRevision,
  );
  const data = result.data;
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;
  const visiblePosts = data?.items ?? [];
  const resetFilters = () => {
    setStatus("all");
    setCategory("all");
    setQuery("");
    setPage(1);
  };

  return (
    <div className="admin-posts admin-data-page admin-posts-page">
      <div className="admin-page-heading">
        <div>
          <h1>内容管理</h1>
          <p>管理文章、草稿与发布计划。</p>
        </div>
        <Button
          variant="primary"
          size="compact"
          disabled={postPending}
          onClick={() => onOpen("compose")}
        >
          <Plus size={16} aria-hidden="true" />
          新建文章
        </Button>
      </div>
      <div className="admin-data-workspace">
        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(String(value));
            setPage(1);
          }}
        >
          <div className="admin-post-filters">
            <div className="admin-post-tabs-scroll">
              <TabsList size="compact" aria-label="按文章状态筛选">
                {filters.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value}>
                    {filter.label} ({data ? data.statusCounts[filter.value] : "…"})
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="admin-post-filter-fields">
              <div className="admin-post-category-field">
                <label className="sr-only" htmlFor="admin-post-category-filter">
                  按分类筛选
                </label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value ?? "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger size="compact" id="admin-post-category-filter">
                    <SelectValue>
                      {category === "all"
                        ? "全部分类"
                        : (categoryItems.find((item) => item.id === category)?.name ??
                          "分类已移除")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {categoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <InputGroup size="compact" className="admin-post-search">
                <InputGroupInput
                  ref={searchRef}
                  aria-label="搜索文章标题、标签、分类和内容"
                  maxLength={200}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索文章标题 / 标签 / 内容…"
                />
                <InputGroupAddon>
                  <Search size={16} aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
              {(term || category !== "all") && (
                <Button size="compact" variant="ghost" onClick={resetFilters}>
                  重置筛选
                </Button>
              )}
            </div>
          </div>
          <TabsPanel value={status} className="admin-post-panel">
            <div className="admin-post-list" aria-busy={result.loading}>
              <PostQueryStatus {...result} />
              <DataTable
                meta={{
                  getRowActions: (post) => ({
                    label: `文章 ${post.title} 的操作`,
                    disabled: postPending || result.loading || Boolean(result.error),
                    actions: [
                      {
                        label: "编辑文章",
                        icon: actionIcons.Pencil,
                        onSelect: () => onEdit(post.id),
                      },
                      {
                        label: "删除文章",
                        icon: actionIcons.Trash2,
                        destructive: true,
                        separator: true,
                        opensDialog: true,
                        onSelect: (trigger) => onDeletePost(post, searchRef.current, trigger),
                      },
                    ],
                  }),
                  editRow: (post) => onEdit(post.id),
                  disableActions: postPending,
                  postClock: now,
                }}
                {...tableState}
                data={visiblePosts}
                columns={columns}
                getRowId={(post) => post.id}
                mode="server"
                rowCount={total}
                loading={result.loading}
                disabled={Boolean(result.error)}
                caption={`文章列表，共 ${total} 篇，第 ${currentPage} 页`}
                tableClassName="admin-post-table"
                emptyState={
                  data && (
                    <div className="admin-post-empty">
                      <FileText size={32} aria-hidden="true" />
                      <h2>{data.statusCounts.all ? "未匹配到相关博文" : "还没有文章"}</h2>
                      <p>
                        {data.statusCounts.all
                          ? "请调整状态、分类或搜索关键词。"
                          : "从第一篇文章开始记录。"}
                      </p>
                      <Button
                        variant="secondary"
                        size="compact"
                        onClick={data.statusCounts.all ? resetFilters : () => onOpen("compose")}
                      >
                        {data.statusCounts.all ? "重置筛选" : "新建文章"}
                      </Button>
                    </div>
                  )
                }
              />
            </div>
          </TabsPanel>
        </Tabs>
      </div>
      <p className="admin-post-session-note">排期暂未启用自动发布；浏览量尚未接入访问采集。</p>
    </div>
  );
}
