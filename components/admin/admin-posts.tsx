"use client";

import { ChevronLeft, ChevronRight, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
const pageSize = 8;

export function AdminPosts() {
  const now = usePostClock();
  const { categoryItems, postRevision, postPending, onOpen, onEdit, onDeletePost } =
    useAdminWorkspace();
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const term = useDebouncedPostQuery(query);
  const result = usePostList(
    { status, categoryId: category, q: term, page, pageSize },
    postRevision,
  );
  const data = result.data;
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 1;
  const currentPage = data?.page ?? page;
  const start = (currentPage - 1) * pageSize;
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
          新建博文
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
              <section className="admin-post-table-scroll" aria-label="文章列表，可横向滚动">
                <table className="admin-post-table">
                  <caption className="sr-only">
                    文章列表，共 {total} 篇，第 {currentPage} 页
                  </caption>
                  <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">文章标题</th>
                      <th scope="col">分类</th>
                      <th scope="col">状态</th>
                      <th scope="col">浏览量</th>
                      <th scope="col">时间</th>
                      <th scope="col">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePosts.map((post) => (
                      <tr key={post.id}>
                        <td>
                          <button
                            type="button"
                            className="admin-post-title"
                            disabled={postPending}
                            onClick={() => onEdit(post.id)}
                          >
                            {post.title}
                          </button>
                          <div className="admin-post-tags">
                            {post.tags.map((tag) => (
                              <span key={tag.id}>#{tag.name}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="admin-post-category">{post.category.name}</span>
                        </td>
                        <td>
                          <span
                            className={`admin-post-status ${post.status === "published" ? "is-published" : post.status === "scheduled" ? "is-scheduled" : ""}`}
                          >
                            {postStatusLabels[post.status]}
                          </span>
                        </td>
                        <td className="admin-post-metric">
                          {post.status === "published" ? "尚未接入" : "—"}
                        </td>
                        <td className="admin-post-metric">
                          {postTime(
                            post.status === "scheduled"
                              ? post.scheduledFor
                              : (post.publishedAt ?? post.updatedAt),
                            post.status !== "scheduled",
                          )}
                          {post.status === "scheduled" &&
                            post.scheduledFor &&
                            now !== null &&
                            Date.parse(post.scheduledFor) <= now && <span> · 已过期</span>}
                        </td>
                        <td>
                          <div className="admin-post-row-actions">
                            <Button
                              variant="ghost"
                              size="compact"
                              aria-label={`编辑文章 ${post.title}`}
                              title="编辑文章"
                              disabled={postPending}
                              onClick={() => onEdit(post.id)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="compact"
                              aria-label={`删除文章 ${post.title}`}
                              title="删除文章"
                              disabled={postPending}
                              onClick={() => onDeletePost(post)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              {data && !total && (
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
              )}
              <div className="admin-post-pagination">
                <span aria-live="polite">
                  显示第 {total ? start + 1 : 0}–{Math.min(start + pageSize, total)} 条，共 {total}{" "}
                  条
                </span>
                <nav aria-label="文章分页">
                  <Button
                    size="compact"
                    variant="ghost"
                    aria-label="上一页"
                    disabled={result.loading || Boolean(result.error) || currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeft size={17} />
                  </Button>
                  <span aria-current="page">
                    {currentPage} / {pageCount}
                  </span>
                  <Button
                    size="compact"
                    variant="ghost"
                    aria-label="下一页"
                    disabled={result.loading || Boolean(result.error) || currentPage >= pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    <ChevronRight size={17} />
                  </Button>
                </nav>
              </div>
            </div>
          </TabsPanel>
        </Tabs>
      </div>
      <p className="admin-post-session-note">
        文章保存到数据库 · 排期暂未启用自动发布。浏览量尚未接入访问采集。
      </p>
    </div>
  );
}
