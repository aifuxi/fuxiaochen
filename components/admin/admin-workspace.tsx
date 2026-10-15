"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import type { PostDetail, PostInput, PostItem } from "@/lib/posts/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { postDisplayTitle } from "@/lib/posts/schema";

import { AdminContext } from "./admin-context";
import { AdminPasskeys } from "./admin-passkeys";
import { AdminShell, type AdminPanel } from "./admin-shell";
import { NotificationCenter, useNotificationSummary } from "./global-operations";
import { useNavigationGuard } from "./navigation-guard";
import { AdminRequestError, postRequest } from "./use-posts";
import { useTaxonomy } from "./use-taxonomy";
import "./admin.css";

type DialogPanel = Exclude<AdminPanel, "compose" | "backup">;

const panelTitles: Record<DialogPanel, string> = {
  notifications: "通知",
  profile: "管理账户",
};

const panelDescriptions: Record<DialogPanel, string> = {
  notifications: "查看待办和执行结果，已读状态随账户保存。",
  profile: "管理通行密钥并退出登录。",
};

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [postRevision, setPostRevision] = useState(0);
  const [operationRevision, setOperationRevision] = useState(0);
  const [operationPending, setOperationPending] = useState(false);
  const operationMutation = useRef(false);
  const [postPending, setPostPending] = useState(false);
  const guardNavigation = useNavigationGuard(false, postPending || operationPending);
  const [writingFocused, setWritingFocused] = useState(false);
  const postMutation = useRef(false);
  const taxonomy = useTaxonomy();
  const [panel, setPanel] = useState<DialogPanel | null>(null);
  const panelReturnFocus = useRef<HTMLElement | null>(null);
  const [message, setMessage] = useState("");
  const notifications = useNotificationSummary(operationRevision);
  const postDeleteFocus = useRef<{
    deleted: boolean;
    fallback: HTMLElement | null;
    trigger: HTMLElement | null;
  }>({ deleted: false, fallback: null, trigger: null });
  const [postDeleteTarget, setPostDeleteTarget] = useState<PostItem | null>(null);
  const [postDeleteError, setPostDeleteError] = useState("");
  const [postDeleteConflict, setPostDeleteConflict] = useState(false);
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
    (name: AdminPanel, returnFocus?: HTMLElement | null) => {
      if (postMutation.current || operationMutation.current) return;
      if (name === "backup") {
        guardNavigation(() => {
          setPanel(null);
          router.push("/admin/backups");
        });
        return;
      }
      if (name === "compose") {
        setPanel(null);
        guardNavigation(() => router.push("/admin/posts/new"));
        return;
      }
      panelReturnFocus.current =
        returnFocus ??
        (document.activeElement instanceof HTMLElement ? document.activeElement : null);
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
  const runOperation = async <T,>(work: () => Promise<T>) => {
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
      }
    }
  };

  return (
    <AdminContext.Provider
      value={{
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
        savePost,
        setPostFeatured,
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
      }}
    >
      <AdminShell
        writingFocused={writingFocused}
        postPending={postPending || operationPending}
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
        <DialogContent className="admin-modal" finalFocus={panelReturnFocus}>
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
              {panel === "notifications" && <NotificationCenter />}
              {panel === "profile" && (
                <div className="admin-modal-section">
                  <p>付小晨 · 管理账户</p>
                  <AdminPasskeys busy={operationPending} runOperation={runOperation} />
                  <form action="/api/logout" method="post">
                    <Button type="submit" variant="secondary" disabled={operationPending}>
                      退出登录
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
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
            》及其标签关联，删除后无法恢复。
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
