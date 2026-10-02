"use client";
import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { postStatusLabels, postTime } from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { PostQueryStatus } from "./post-status";
import { useDebouncedPostQuery, usePostList, usePostClock } from "./use-posts";

export function PostBrowser({ mode }: { mode: "search" | "schedule" }) {
  const now = usePostClock();
  const { postRevision, postPending, onEdit, onOpen, cancelPostSchedule, onMessage } =
    useAdminWorkspace();
  const [input, setInput] = useState("");
  const q = useDebouncedPostQuery(input);
  const [page, setPage] = useState(1);
  const search = mode === "search";
  const query = usePostList(
    { q: search ? q : "", status: search ? undefined : "scheduled", page },
    postRevision,
    !search || Boolean(q),
  );
  const data = query.data;
  return (
    <div className="admin-modal-section admin-post-browser">
      {search ? (
        <>
          <label htmlFor="admin-search-input">搜索文章标题、正文、标签和分类</label>
          <InputGroup>
            <InputGroupInput
              id="admin-search-input"
              value={input}
              maxLength={200}
              onChange={(event) => {
                setInput(event.target.value);
                setPage(1);
              }}
              placeholder="输入关键词…"
            />
            <InputGroupAddon>
              <Search size={16} aria-hidden="true" />
            </InputGroupAddon>
          </InputGroup>
        </>
      ) : (
        <>
          <p>排期已持久化，暂未启用自动发布。取消排期会将文章转为草稿。</p>
          <Button variant="primary" disabled={postPending} onClick={() => onOpen("compose")}>
            添加计划
          </Button>
        </>
      )}
      {search && !q ? (
        <p className="admin-empty">输入关键词开始搜索。</p>
      ) : (
        <PostQueryStatus {...query} />
      )}
      <div className="admin-result-list">
        {data?.items.map((post) => (
          <div className="admin-managed-row" key={post.id}>
            <button
              className="admin-result"
              type="button"
              disabled={postPending}
              onClick={() => onEdit(post.id)}
            >
              <strong>{post.title}</strong>
              <span>
                {post.category.name} · {postStatusLabels[post.status]} ·{" "}
                {postTime(search ? post.createdAt : post.scheduledFor)}
                {!search &&
                post.scheduledFor &&
                now !== null &&
                Date.parse(post.scheduledFor) <= now
                  ? " · 已过期"
                  : ""}
              </span>
            </button>
            {!search && (
              <Button
                variant="ghost"
                size="sm"
                disabled={postPending}
                onClick={async () => {
                  try {
                    await cancelPostSchedule(post);
                  } catch (error) {
                    onMessage(error instanceof Error ? error.message : "取消排期失败。");
                  }
                }}
              >
                取消排期
              </Button>
            )}
          </div>
        ))}
      </div>
      {data && !data.items.length && (
        <p className="admin-empty">{search ? "没有找到相关文章。" : "暂无排期。"}</p>
      )}
      {data && (
        <nav className="admin-form-actions" aria-label={search ? "搜索结果分页" : "文章排期分页"}>
          <Button
            variant="ghost"
            size="sm"
            disabled={data.page <= 1 || postPending}
            onClick={() => setPage(data.page - 1)}
          >
            上一页
          </Button>
          <span aria-live="polite">
            {data.page} / {data.pageCount} · 共 {data.total} 篇
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={data.page >= data.pageCount || postPending}
            onClick={() => setPage(data.page + 1)}
          >
            下一页
          </Button>
        </nav>
      )}
    </div>
  );
}
