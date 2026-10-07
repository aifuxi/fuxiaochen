"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import type { CommentItem } from "@/lib/comments/schema";
import type { PostDetail, PostInput, PostItem, PostSummary } from "@/lib/posts/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MEDIA_SIZE_HINT } from "@/lib/media/schema";
import { postDisplayTitle } from "@/lib/posts/schema";

import { AdminContext } from "./admin-context";
import { AdminShell, type AdminPanel } from "./admin-shell";
import { GlobalSearch, NotificationCenter, useNotificationSummary } from "./global-operations";
import { MediaUploadStatus } from "./media-upload-status";
import { useNavigationGuard } from "./navigation-guard";
import { commentRequest, useComments } from "./use-comments";
import { useMediaUploads } from "./use-media";
import { AdminRequestError, postRequest, usePostQuery } from "./use-posts";
import { useTaxonomy } from "./use-taxonomy";
import "./admin.css";

type DialogPanel = Exclude<
  AdminPanel,
  "compose" | "comments" | "analytics" | "backup" | "categories" | "schedule"
>;

const panelTitles: Record<DialogPanel, string> = {
  search: "全局内容检索",
  notifications: "通知",
  profile: "管理账户",
  upload: "上传媒体",
};

const panelDescriptions: Record<DialogPanel, string> = {
  search: "检索文章、分类、标签、评论、媒体、友链与更新日志。",
  notifications: "查看待办和执行结果，已读状态随账户保存。",
  profile: "查看账户并退出登录。",
  upload: "选择图片或附件上传到媒体库。",
};

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [postRevision, setPostRevision] = useState(0);
  const [operationRevision, setOperationRevision] = useState(0);
  const [operationPending, setOperationPending] = useState(false);
  const operationMutation = useRef(false);
  const summary = usePostQuery("/summary", postRevision, postRequest<PostSummary>);
  const [postPending, setPostPending] = useState(false);
  const guardNavigation = useNavigationGuard(false, postPending || operationPending);
  const [writingFocused, setWritingFocused] = useState(false);
  const postMutation = useRef(false);
  const taxonomy = useTaxonomy();
  const [panel, setPanel] = useState<DialogPanel | null>(null);
  const [commentDeleteTarget, setCommentDeleteTarget] = useState<CommentItem | null>(null);
  const [commentDeleteError, setCommentDeleteError] = useState("");
  const [commentDeleteConflict, setCommentDeleteConflict] = useState(false);
  const [commentDeleteReloading, setCommentDeleteReloading] = useState(false);
  const commentDeleteFocus = useRef<{
    deleted: boolean;
    fallback: HTMLElement | null;
    trigger: HTMLElement | null;
  }>({
    deleted: false,
    fallback: null,
    trigger: null,
  });
  const [message, setMessage] = useState("");
  const commentState = useComments(postRevision, setMessage);
  const notifications = useNotificationSummary(operationRevision + commentState.commentRevision);
  const commentDeleteBusy = commentState.commentPending || commentDeleteReloading;
  const postDeleteFocus = useRef<{
    deleted: boolean;
    fallback: HTMLElement | null;
    trigger: HTMLElement | null;
  }>({ deleted: false, fallback: null, trigger: null });
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

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const openPanel = useCallback(
    (name: AdminPanel) => {
      if (postMutation.current || operationMutation.current) return;
      if (name === "comments" || name === "analytics") {
        setPanel(null);
        guardNavigation(() => router.push(`/admin/${name}`));
        return;
      }
      if (name === "backup" || name === "categories" || name === "schedule") {
        guardNavigation(() => {
          setPanel(null);
          router.push(
            name === "schedule"
              ? "/admin/posts?status=scheduled"
              : name === "backup"
                ? "/admin/backups"
                : "/admin/categories",
          );
        });
        return;
      }
      if (name === "compose") {
        setPanel(null);
        guardNavigation(() => router.push("/admin/posts/new"));
        return;
      }
      setPanel(name);
    },
    [router, guardNavigation],
  );

  const openEditor = (id: string) => {
    if (postMutation.current || operationMutation.current) return;
    setPanel(null);
    const returnTo =
      location.pathname === "/admin/posts" ? location.pathname + location.search : "/admin/posts";
    guardNavigation(() =>
      router.push(
        `/admin/posts/${encodeURIComponent(id)}/edit?returnTo=${encodeURIComponent(returnTo)}`,
      ),
    );
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
  const setPostFeatured = (post: PostItem) =>
    mutatePost(
      () =>
        postRequest<PostItem>(`/${post.id}/featured`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFeatured: !post.isFeatured, version: post.version }),
        }),
      post.isFeatured ? "已取消精选" : "已设为精选",
    );
  const cancelPostSchedule = (post: PostItem) =>
    mutatePost(async () => {
      const latest = await postRequest<PostDetail>(`/${post.id}`);
      return postRequest<PostDetail>(`/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: latest.title,
          slug: latest.slug,
          content: latest.content,
          summary: latest.summary,
          isFeatured: latest.isFeatured,
          featuredOrder: latest.featuredOrder,
          categoryId: latest.categoryId,
          tagIds: latest.tags.map((tag) => tag.id),
          status: "draft",
          scheduledFor: null,
          version: post.version,
        }),
      });
    }, "排期已取消，文章已转为草稿");

  const pendingCount = commentState.commentSummary?.statusCounts.pending ?? null;
  const runOperation = async <T,>(work: () => Promise<T>, refreshPosts = false) => {
    if (operationMutation.current || postMutation.current) throw new Error("请等待当前操作完成。");
    operationMutation.current = true;
    setOperationPending(true);
    try {
      return await work();
    } finally {
      operationMutation.current = false;
      if (mounted.current) {
        setOperationPending(false);
        setOperationRevision((value) => value + 1);
        if (refreshPosts) setPostRevision((value) => value + 1);
      }
    }
  };

  return (
    <AdminContext.Provider
      value={{
        ...mediaState,
        onMessage: setMessage,
        postRevision,
        postPending: postPending || operationPending,
        operationRevision,
        runOperation,
        onNavigate: (href) => {
          if (!postMutation.current && !operationMutation.current) {
            setPanel(null);
            guardNavigation(() => router.push(href));
          }
        },
        writingFocused,
        setWritingFocused,
        postSummary: summary.data,
        postSummaryLoading: summary.loading,
        postSummaryError: summary.error,
        reloadPostSummary: summary.reload,
        savePost,
        cancelPostSchedule,
        setPostFeatured,
        ...commentState,
        ...taxonomy,
        onOpen: openPanel,
        onEdit: openEditor,
        onDeletePost: (post, fallbackFocus, triggerFocus) => {
          postDeleteFocus.current = {
            deleted: false,
            fallback: fallbackFocus ?? null,
            trigger: triggerFocus ?? null,
          };
          setPostDeleteTarget(post);
          setPostDeleteError("");
          setPostDeleteConflict(false);
        },
        onDeleteComment: (comment, fallbackFocus, triggerFocus) => {
          commentDeleteFocus.current = {
            deleted: false,
            fallback: fallbackFocus ?? null,
            trigger: triggerFocus ?? null,
          };
          setCommentDeleteTarget(comment);
          setCommentDeleteError("");
          setCommentDeleteConflict(false);
        },
      }}
    >
      <AdminShell
        writingFocused={writingFocused}
        postPending={postPending || operationPending}
        pendingCount={pendingCount}
        unreadCount={notifications.data?.unreadCount ?? null}
        notificationError={notifications.error}
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
          if (!open && !postMutation.current && !operationMutation.current) setPanel(null);
        }}
      >
        <DialogContent
          className="admin-modal"
          initialFocus={
            panel === "search" ? () => document.getElementById("admin-global-search") : undefined
          }
        >
          {panel && (
            <>
              <div className="admin-modal-heading">
                <div>
                  <DialogTitle>{panelTitles[panel]}</DialogTitle>
                  <DialogDescription>{panelDescriptions[panel]}</DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="关闭"
                  disabled={postPending || operationPending}
                  onClick={() => setPanel(null)}
                >
                  <X size={18} />
                </Button>
              </div>
              {panel === "search" && <GlobalSearch />}
              {panel === "notifications" && <NotificationCenter />}
              {panel === "profile" && (
                <div className="admin-modal-section">
                  <p>付小晨 · 管理账户</p>
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
                      guardNavigation(() => router.push("/admin/media"));
                    }}
                  >
                    查看媒体库
                  </Button>
                </div>
              )}
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
              : commentDeleteFocus.current.trigger?.isConnected
                ? commentDeleteFocus.current.trigger
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
        <DialogContent
          className="admin-confirm"
          finalFocus={() =>
            postDeleteFocus.current.deleted
              ? (postDeleteFocus.current.fallback ?? true)
              : postDeleteFocus.current.trigger?.isConnected
                ? postDeleteFocus.current.trigger
                : (postDeleteFocus.current.fallback ?? true)
          }
        >
          <DialogTitle>删除文章？</DialogTitle>
          <DialogDescription>
            永久删除《{postDeleteTarget ? postDisplayTitle(postDeleteTarget.title) : ""}
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
                  postDeleteFocus.current.deleted = true;
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
