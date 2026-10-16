"use client";

import {
  Check,
  CheckCircle2,
  ExternalLink,
  Star,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

import type { PostList } from "@/lib/posts/schema";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { RowActions } from "@/components/ui/menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { postDisplayTitle, postStatusLabels, postTime, type PostStatus } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { usePostListState } from "./post-list-state";
import { PostQueryStatus } from "./post-status";
import { RecordListMore, RecordPageSize, RecordSort } from "./record-list";
import { usePagedResource } from "./use-paged-resource";
import { postRequest, useDebouncedPostQuery } from "./use-posts";
import "./admin-data-workspace.css";
import "./admin-posts.css";

const filters: { value: "all" | PostStatus; label: string }[] = [
  { value: "all", label: "全部文章" },
  { value: "published", label: "已发布" },
  { value: "draft", label: "草稿箱" },
];
const statusIcons = {
  all: <FileText size={16} aria-hidden="true" />,
  published: <CheckCircle2 size={16} aria-hidden="true" />,
  draft: <Pencil size={16} aria-hidden="true" />,
};

const actionIcons = {
  Pencil: <Pencil size={16} />,
  Trash2: <Trash2 size={16} />,
  ExternalLink: <ExternalLink size={16} />,
  Star: <Star size={16} />,
};

const loadPosts = postRequest<PostList>;

export function AdminPosts() {
  const {
    categoryItems,
    postRevision,
    postPending,
    onOpen,
    onEdit,
    onDeletePost,
    setPostFeatured,
  } = useAdminWorkspace();
  const { state, patch } = usePostListState();
  const status = state.status ?? "all";
  const featured = state.featured;
  const category = state.categoryId ?? "all";
  const query = state.q;
  const setStatus = (value: string) => patch({ status: value, page: 1 });
  const setCategory = (value: string) => patch({ categoryId: value, page: 1 });
  const setFeatured = (value: string) => patch({ featured: value, page: 1 });
  const setQuery = (value: string) => patch({ q: value, page: 1 });
  const [actionError, setActionError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const term = useDebouncedPostQuery(query);
  // 筛选、排序仍覆盖服务端完整集合，追加只合并已返回的批次。
  const params = new URLSearchParams({ pageSize: String(state.pageSize) });
  for (const [key, value] of Object.entries({
    status,
    categoryId: category,
    featured,
    q: term,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
  })) {
    if (value !== undefined && value !== "" && value !== "all") params.set(key, value);
  }
  const result = usePagedResource<PostList>(`?${params}`, postRevision, loadPosts, state.page);
  const data = result.data;
  const total = data?.total ?? 0;
  const visiblePosts = data?.items ?? [];
  const disabled = postPending || result.loading || result.loadingMore || Boolean(result.error);
  const sortValue = state.sortBy ? `${state.sortBy}-${state.sortDirection ?? "asc"}` : "default";
  const resetFilters = () =>
    patch({ status: "all", categoryId: "all", featured: "all", q: "", page: 1 });
  const editPost = (id: string) => {
    if (disabled) return;
    // 追加不改地址；进入编辑前记录该文章的真实批次，返回时保留筛选和位置。
    patch({ page: result.pageForRecord(id) ?? state.page });
    onEdit(id);
  };

  return (
    <div className="admin-posts admin-data-page admin-posts-page">
      <div className="admin-page-heading">
        <div>
          <h1>文章管理</h1>
          <p>管理文章与草稿。</p>
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
          orientation="horizontal"
          onValueChange={(value) => {
            setStatus(String(value));
          }}
        >
          <div className="admin-post-status-bar">
            <div className="admin-post-tabs-scroll">
              <TabsList size="compact" aria-label="按文章状态筛选">
                {filters.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value} disabled={postPending}>
                    {statusIcons[filter.value]}
                    <span>{filter.label}</span>
                    <span className="admin-post-tab-count">
                      {data ? data.statusCounts[filter.value] : "…"}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {data && <span className="admin-post-result-count">{total} 篇文章</span>}
          </div>
          <div className="admin-post-filters">
            <InputGroup size="compact" className="admin-post-search">
              <InputGroupAddon>
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchRef}
                aria-label="搜索文章标题、摘要、标签、分类和内容"
                maxLength={200}
                value={query}
                disabled={postPending}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标题 / 摘要 / 标签 / 内容…"
              />
            </InputGroup>
            <div className="admin-post-filter-fields">
              <div className="admin-post-category-field">
                <label className="sr-only" htmlFor="admin-post-category-filter">
                  按分类筛选
                </label>
                <Select
                  value={category}
                  disabled={postPending}
                  onValueChange={(value) => {
                    setCategory(value ?? "all");
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
              <div className="admin-post-category-field">
                <Select
                  value={featured}
                  disabled={postPending}
                  onValueChange={(value) => {
                    setFeatured(value ?? "all");
                  }}
                >
                  <SelectTrigger size="compact" aria-label="按精选筛选">
                    <SelectValue>
                      {featured === "featured"
                        ? "精选"
                        : featured === "unfeatured"
                          ? "非精选"
                          : "全部精选状态"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="featured">精选</SelectItem>
                    <SelectItem value="unfeatured">非精选</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <RecordSort
                label="文章排序"
                value={sortValue}
                disabled={postPending}
                onChange={(value) => {
                  const [sortBy, sortDirection] = value.split("-");
                  patch({
                    sortBy: value === "default" ? undefined : sortBy,
                    sortDirection: value === "default" ? undefined : sortDirection,
                    page: 1,
                  });
                }}
                options={[
                  ["default", "默认顺序"],
                  ["time-desc", "最新优先"],
                  ["time-asc", "最早优先"],
                  ["title-asc", "标题正序"],
                  ["title-desc", "标题倒序"],
                  ["category-asc", "分类正序"],
                  ["category-desc", "分类倒序"],
                  ["status-asc", "草稿优先"],
                  ["status-desc", "已发布优先"],
                ]}
              />
              <RecordPageSize
                value={state.pageSize}
                disabled={postPending}
                onChange={(pageSize) => patch({ pageSize, page: 1 })}
              />
              {(query || category !== "all" || featured !== "all") && (
                <Button
                  size="compact"
                  variant="ghost"
                  disabled={postPending}
                  onClick={resetFilters}
                >
                  重置筛选
                </Button>
              )}
            </div>
          </div>
          <TabsPanel value={status} className="admin-post-panel">
            <div className="admin-post-list" aria-busy={result.loading}>
              <PostQueryStatus {...result} />
              {actionError && (
                <p className="admin-error" role="alert">
                  {actionError}
                </p>
              )}
              <ul className="admin-record-list" aria-label="文章列表">
                {visiblePosts.map((post) => (
                  <li
                    className="admin-record-item"
                    key={post.id}
                    data-record-id={post.id}
                    tabIndex={-1}
                  >
                    <div className="admin-record-copy">
                      <div className="admin-entry-heading">
                        <h2>
                          <button
                            type="button"
                            className="admin-post-title"
                            disabled={disabled}
                            onClick={() => editPost(post.id)}
                          >
                            {postDisplayTitle(post.title)}
                          </button>
                        </h2>
                        <div className="admin-entry-states">
                          <span
                            className={`admin-post-status ${post.status === "published" ? "is-published" : ""}`}
                          >
                            {post.status === "published" && <Check size={13} aria-hidden="true" />}
                            {postStatusLabels[post.status]}
                          </span>
                          {post.isFeatured && (
                            <span className="admin-post-featured">精选 · {post.featuredOrder}</span>
                          )}
                        </div>
                      </div>
                      <p className="admin-entry-description">{post.summary || "未填写摘要"}</p>
                      <div className="admin-entry-meta">
                        <span>{post.category?.name ?? "未分类"}</span>
                        {post.tags.map((tag) => (
                          <span key={tag.id}>#{tag.name}</span>
                        ))}
                        <time
                          dateTime={post.publishedAt ?? post.updatedAt}
                          className="admin-post-metric"
                        >
                          {postTime(post.publishedAt ?? post.updatedAt, true)}
                        </time>
                      </div>
                    </div>
                    <RowActions
                      label={`文章 ${postDisplayTitle(post.title)} 的操作`}
                      disabled={disabled}
                      actions={[
                        {
                          label: "编辑文章",
                          icon: actionIcons.Pencil,
                          onSelect: () => editPost(post.id),
                        },
                        ...(post.status === "published"
                          ? [
                              {
                                label: "查看前台",
                                icon: actionIcons.ExternalLink,
                                href: `/posts/${post.slug}`,
                                target: "_blank" as const,
                              },
                            ]
                          : []),
                        {
                          label: post.isFeatured ? "取消精选" : "设为精选",
                          icon: actionIcons.Star,
                          onSelect: () => {
                            setActionError("");
                            void setPostFeatured(post)
                              .catch((cause: unknown) => {
                                setActionError(
                                  cause instanceof Error
                                    ? cause.message
                                    : "操作失败，请核对列表后重试。",
                                );
                                result.reload();
                              })
                              .finally(() =>
                                requestAnimationFrame(() => searchRef.current?.focus()),
                              );
                          },
                        },
                        {
                          label: "删除文章",
                          icon: actionIcons.Trash2,
                          destructive: true,
                          separator: true,
                          opensDialog: true,
                          onSelect: (trigger) => onDeletePost(post, searchRef.current, trigger),
                        },
                      ]}
                    />
                  </li>
                ))}
              </ul>
              {data && !result.loading && !result.error && !visiblePosts.length && (
                <div className="admin-post-empty">
                  <FileText size={32} aria-hidden="true" />
                  <h2>{data.statusCounts.all ? "未匹配到相关博文" : "还没有文章"}</h2>
                  <p>
                    {data.statusCounts.all
                      ? "请调整状态、分类、精选或搜索关键词。"
                      : "从第一篇文章开始记录。"}
                  </p>
                  <Button
                    variant="secondary"
                    size="compact"
                    disabled={postPending}
                    onClick={data.statusCounts.all ? resetFilters : () => onOpen("compose")}
                  >
                    {data.statusCounts.all ? "重置筛选" : "新建文章"}
                  </Button>
                </div>
              )}
              <RecordListMore resource={result} label="显示更多文章" disabled={postPending} />
            </div>
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
