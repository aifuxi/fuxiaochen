"use client";

import { Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";

import type { CommentItem } from "@/lib/comments/schema";
import type { PostDetail, PostInput, PostItem, PostSummary } from "@/lib/posts/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MEDIA_SIZE_HINT } from "@/lib/media/schema";

import { AdminContext } from "./admin-context";
import { AdminShell, type AdminPanel } from "./admin-shell";
import { MediaUploadStatus } from "./media-upload-status";
import { initialNotices, initialSources, traffic30Days } from "./mock-data";
import { PostBrowser } from "./post-browser";
import { TaxonomyStatus } from "./taxonomy-status";
import { commentRequest, useComments } from "./use-comments";
import { useMediaUploads } from "./use-media";
import { AdminRequestError, postRequest, usePostQuery } from "./use-posts";
import { useTaxonomy } from "./use-taxonomy";
import "./admin.css";

type DialogPanel = Exclude<AdminPanel, "compose">;

const panelTitles: Record<DialogPanel, string> = {
  search: "全局内容检索",
  profile: "管理账户",
  comments: "评论管理",
  upload: "上传媒体",
  categories: "分类与标签",
  analytics: "流量详细分析",
  schedule: "定时发布计划",
};

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [postRevision, setPostRevision] = useState(0);
  const summary = usePostQuery("/summary", postRevision, postRequest<PostSummary>);
  const [postPending, setPostPending] = useState(false);
  const postMutation = useRef(false);
  const [notices, setNotices] = useState(initialNotices);
  const taxonomy = useTaxonomy();
  const taxonomyDisabled =
    taxonomy.taxonomyLoading || Boolean(taxonomy.taxonomyError) || taxonomy.taxonomyPending;
  const [panel, setPanel] = useState<DialogPanel | null>(null);
  const [commentDeleteTarget, setCommentDeleteTarget] = useState<CommentItem | null>(null);
  const [commentDeleteError, setCommentDeleteError] = useState("");
  const [commentDeleteConflict, setCommentDeleteConflict] = useState(false);
  const [commentDeleteReloading, setCommentDeleteReloading] = useState(false);
  const commentDeleteFocus = useRef<{ deleted: boolean; fallback: HTMLElement | null }>({
    deleted: false,
    fallback: null,
  });
  const [message, setMessage] = useState("");
  const commentState = useComments(postRevision, setMessage);
  const commentDeleteBusy = commentState.commentPending || commentDeleteReloading;
  const [postDeleteTarget, setPostDeleteTarget] = useState<PostItem | null>(null);
  const [postDeleteError, setPostDeleteError] = useState("");
  const [postDeleteConflict, setPostDeleteConflict] = useState(false);
  const mediaState = useMediaUploads(setMessage);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const openPanel = useCallback(
    (name: AdminPanel) => {
      if (name === "comments") {
        router.push("/admin/comments");
        return;
      }
      if (postMutation.current) return;
      if (name === "compose") {
        setPanel(null);
        router.push("/admin/posts/new");
        return;
      }
      setPanel(name);
    },
    [router],
  );

  const openEditor = (id: string) => {
    if (postMutation.current) return;
    setPanel(null);
    router.push(`/admin/posts/${encodeURIComponent(id)}/edit`);
  };
  const mutatePost = async <T,>(work: () => Promise<T>, success: string) => {
    if (postMutation.current) throw new Error("请等待当前文章操作完成。");
    postMutation.current = true;
    setPostPending(true);
    try {
      const result = await work();
      if (mounted.current) {
        setPostRevision((value) => value + 1);
        void taxonomy.reloadTaxonomy();
        setMessage(success);
      }
      return result;
    } finally {
      postMutation.current = false;
      if (mounted.current) setPostPending(false);
    }
  };
  const savePost = (input: PostInput, initial: PostDetail | null) =>
    mutatePost(
      () =>
        postRequest<PostDetail>(initial ? `/${initial.id}` : "", {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initial ? { ...input, version: initial.version } : input),
        }),
      initial ? "文章已更新" : "文章已创建",
    );
  const cancelPostSchedule = (post: PostItem) =>
    mutatePost(async () => {
      const latest = await postRequest<PostDetail>(`/${post.id}`);
      return postRequest<PostDetail>(`/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: latest.title,
          content: latest.content,
          categoryId: latest.categoryId,
          tagIds: latest.tags.map((tag) => tag.id),
          status: "draft",
          scheduledFor: null,
          version: post.version,
        }),
      });
    }, "排期已取消，文章已转为草稿");

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await taxonomy.createCategory({ name: newCategory.trim(), color: "#0066df" });
      setNewCategory("");
      setMessage("分类已添加");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "分类创建失败。");
    }
  };

  const pendingCount = commentState.commentSummary?.statusCounts.pending ?? null;

  return (
    <AdminContext.Provider
      value={{
        ...mediaState,
        onMessage: setMessage,
        postRevision,
        postPending,
        postSummary: summary.data,
        postSummaryLoading: summary.loading,
        postSummaryError: summary.error,
        reloadPostSummary: summary.reload,
        savePost,
        cancelPostSchedule,
        ...commentState,
        ...taxonomy,
        onOpen: openPanel,
        onEdit: openEditor,
        onDeletePost: (post) => {
          setPostDeleteTarget(post);
          setPostDeleteError("");
          setPostDeleteConflict(false);
        },
        onDeleteComment: (comment, fallbackFocus) => {
          commentDeleteFocus.current = { deleted: false, fallback: fallbackFocus ?? null };
          setCommentDeleteTarget(comment);
          setCommentDeleteError("");
          setCommentDeleteConflict(false);
        },
        onBackup: () => setMessage("模拟备份已完成；未连接真实服务器"),
      }}
    >
      <AdminShell
        pendingCount={pendingCount}
        notices={notices}
        onReadNotice={(id) =>
          setNotices((current) =>
            current.map((notice) => (notice.id === id ? { ...notice, read: true } : notice)),
          )
        }
        onReadAllNotices={() =>
          setNotices((current) => current.map((notice) => ({ ...notice, read: true })))
        }
        onOpen={openPanel}
      >
        {children}
      </AdminShell>
      {message && (
        <output className="admin-toast">
          {message}
          <Button
            type="button"
            size="compact"
            variant="ghost"
            aria-label="关闭提示"
            onClick={() => setMessage("")}
          >
            <X size={14} />
          </Button>
        </output>
      )}
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open && !postMutation.current) setPanel(null);
        }}
      >
        <DialogContent className="admin-modal">
          {panel && (
            <>
              <div className="admin-modal-heading">
                <div>
                  <DialogTitle>{panelTitles[panel]}</DialogTitle>
                  <DialogDescription>
                    {["categories", "search", "schedule"].includes(panel)
                      ? "文章、分类与标签已持久化；暂未启用自动发布。"
                      : panel === "upload"
                        ? "文件上传并通过核验后保存到媒体库。"
                        : panel === "profile"
                          ? "当前账户使用真实登录会话。"
                          : "演示数据，不代表实际通知或监控结果。"}
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="关闭"
                  disabled={postPending}
                  onClick={() => setPanel(null)}
                >
                  <X size={18} />
                </Button>
              </div>
              {panel === "search" && <PostBrowser mode="search" />}
              {panel === "profile" && (
                <div className="admin-modal-section">
                  <p>fuxiaochen · 管理账户</p>
                  <p className="admin-muted">当前使用本项目的现有登录会话。</p>
                  <form action="/api/logout" method="post">
                    <Button type="submit" variant="secondary">
                      退出登录
                    </Button>
                  </form>
                </div>
              )}
              {panel === "upload" && (
                <div className="admin-modal-section">
                  <label htmlFor="admin-upload">选择图片或附件</label>
                  <input
                    id="admin-upload"
                    className="admin-file-input"
                    type="file"
                    multiple
                    disabled={mediaState.uploadingMedia}
                    onChange={(event) => {
                      const selected = Array.from(event.target.files ?? []);
                      event.target.value = "";
                      void mediaState.onUploadMedia(selected);
                    }}
                  />
                  <p className="admin-muted">
                    {MEDIA_SIZE_HINT}文件上传并通过核验后可复制永久链接。
                  </p>
                  <MediaUploadStatus />
                  <Button
                    onClick={() => {
                      setPanel(null);
                      router.push("/admin/media");
                    }}
                  >
                    查看媒体库
                  </Button>
                </div>
              )}
              {panel === "categories" && (
                <div className="admin-modal-section">
                  <TaxonomyStatus />
                  <form className="admin-inline-form" onSubmit={addCategory}>
                    <label htmlFor="admin-new-category">新增分类</label>
                    <div>
                      <Input
                        id="admin-new-category"
                        disabled={taxonomy.taxonomyPending}
                        maxLength={40}
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        placeholder="分类名称"
                      />
                      <Button type="submit" variant="primary" disabled={taxonomyDisabled}>
                        {taxonomy.taxonomyPending ? "正在保存…" : "添加"}
                      </Button>
                    </div>
                  </form>
                  <div className="admin-category-list">
                    {taxonomy.categoryItems.map((item) => (
                      <div key={item.id}>
                        <span>{item.name}</span>
                        <small>关联 {item.postCount} 篇文章</small>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={taxonomyDisabled}
                          onClick={async () => {
                            try {
                              await taxonomy.deleteCategory(item.id);
                              setMessage("分类已删除");
                            } catch (error) {
                              setMessage(error instanceof Error ? error.message : "删除失败。");
                            }
                          }}
                          aria-label={`删除分类 ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    ))}
                    {!taxonomyDisabled && !taxonomy.categoryItems.length && (
                      <p>暂无分类，请先添加分类。</p>
                    )}
                    <Link href="/admin/categories">管理分类与标签</Link>
                  </div>
                </div>
              )}
              {panel === "analytics" && (
                <div className="admin-modal-section">
                  <div className="admin-analytics-summary">
                    <div>
                      <span>30 天访问量</span>
                      <strong>
                        {traffic30Days
                          .reduce((sum, point) => sum + point.visits, 0)
                          .toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span>主要来源</span>
                      <strong>{initialSources[0].name}</strong>
                    </div>
                  </div>
                  <h3>来源构成</h3>
                  <div className="admin-category-list">
                    {initialSources.map((source) => (
                      <div key={source.name}>
                        <span>{source.name}</span>
                        <strong>{source.percentage}%</strong>
                      </div>
                    ))}
                  </div>
                  <p className="admin-muted">图表范围可在仪表盘切换，以上为固定演示数据。</p>
                </div>
              )}
              {panel === "schedule" && <PostBrowser mode="schedule" />}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={commentDeleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !commentDeleteBusy) setCommentDeleteTarget(null);
        }}
      >
        <DialogContent
          className="admin-confirm"
          finalFocus={() =>
            commentDeleteFocus.current.deleted && commentDeleteFocus.current.fallback?.isConnected
              ? commentDeleteFocus.current.fallback
              : true
          }
        >
          <DialogTitle>删除评论？</DialogTitle>
          <DialogDescription>
            永久删除 {commentDeleteTarget?.author} 的评论及其全部回复，删除后无法恢复。
          </DialogDescription>
          {commentDeleteError && (
            <p className="admin-post-error" role="alert">
              {commentDeleteError}
            </p>
          )}
          {commentDeleteConflict && (
            <Button
              variant="secondary"
              disabled={commentDeleteBusy}
              onClick={async () => {
                if (!commentDeleteTarget) return;
                setCommentDeleteReloading(true);
                try {
                  const latest = await commentRequest<CommentItem>(`/${commentDeleteTarget.id}`);
                  setCommentDeleteTarget(latest);
                  setCommentDeleteConflict(false);
                  setCommentDeleteError("已载入最新评论，请重新确认删除。");
                } catch (error) {
                  setCommentDeleteError(error instanceof Error ? error.message : "重新载入失败。");
                } finally {
                  setCommentDeleteReloading(false);
                }
              }}
            >
              重新载入最新评论
            </Button>
          )}
          <div className="admin-form-actions">
            <Button
              variant="ghost"
              disabled={commentDeleteBusy}
              onClick={() => setCommentDeleteTarget(null)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              disabled={commentDeleteBusy || commentDeleteConflict}
              onClick={async () => {
                if (!commentDeleteTarget) return;
                setCommentDeleteError("");
                try {
                  await commentState.deleteComment(commentDeleteTarget);
                  commentDeleteFocus.current.deleted = true;
                  setCommentDeleteTarget(null);
                } catch (error) {
                  setCommentDeleteError(
                    error instanceof Error ? error.message : "删除失败，请重试。",
                  );
                  setCommentDeleteConflict(
                    error instanceof AdminRequestError &&
                      ["VERSION_CONFLICT", "NOT_FOUND"].includes(error.code),
                  );
                }
              }}
            >
              {commentState.commentPending ? "正在删除…" : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={postDeleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !postMutation.current) setPostDeleteTarget(null);
        }}
      >
        <DialogContent className="admin-confirm">
          <DialogTitle>删除文章？</DialogTitle>
          <DialogDescription>
            永久删除《{postDeleteTarget?.title}
            》及其标签关联、文章排期和全部评论回复，删除后无法恢复。
          </DialogDescription>
          {postDeleteError && (
            <p className="admin-post-error" role="alert">
              {postDeleteError}
            </p>
          )}
          {postDeleteConflict && (
            <Button
              variant="secondary"
              disabled={postPending}
              onClick={() => {
                setPostDeleteTarget(null);
                setPostRevision((value) => value + 1);
              }}
            >
              刷新列表后重新确认
            </Button>
          )}
          <div className="admin-form-actions">
            <Button
              variant="ghost"
              disabled={postPending}
              onClick={() => setPostDeleteTarget(null)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              disabled={postPending}
              onClick={async () => {
                if (!postDeleteTarget) return;
                setPostDeleteError("");
                try {
                  await mutatePost(
                    () =>
                      postRequest<{ id: string }>(
                        `/${postDeleteTarget.id}?version=${postDeleteTarget.version}`,
                        { method: "DELETE" },
                      ),
                    "文章已永久删除",
                  );
                  setPostDeleteTarget(null);
                } catch (error) {
                  setPostDeleteError(error instanceof Error ? error.message : "删除失败，请重试。");
                  setPostDeleteConflict(
                    error instanceof AdminRequestError &&
                      ["VERSION_CONFLICT", "NOT_FOUND"].includes(error.code),
                  );
                }
              }}
            >
              {postPending ? "正在删除…" : "确认删除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminContext.Provider>
  );
}
