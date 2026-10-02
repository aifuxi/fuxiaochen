"use client";

import { Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";

import type { PostDetail, PostInput, PostItem, PostSummary } from "@/lib/posts/schema";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { AdminContext } from "./admin-context";
import { AdminShell, type AdminPanel } from "./admin-shell";
import { initialReleaseLogs } from "./changelog-mock-data";
import { initialFriendsLinks } from "./friends-links-mock-data";
import {
  initialMedia,
  type MediaItem,
  initialComments,
  initialNotices,
  initialSources,
  traffic30Days,
} from "./mock-data";
import { PostBrowser } from "./post-browser";
import { PostEditor } from "./post-editor";
import { initialSettings } from "./settings-mock-data";
import { TaxonomyStatus } from "./taxonomy-status";
import { AdminRequestError, postRequest, usePostQuery } from "./use-posts";
import { useTaxonomy } from "./use-taxonomy";
import "./admin.css";

const panelTitles: Record<AdminPanel, string> = {
  search: "全局内容检索",
  compose: "文章编辑",
  notifications: "系统通知",
  profile: "管理账户",
  comments: "评论管理",
  upload: "模拟上传媒体",
  categories: "分类与标签",
  analytics: "流量详细分析",
  schedule: "定时发布计划",
};

function mediaUploadTime() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).slice(0, 16);
}

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [postRevision, setPostRevision] = useState(0);
  const summary = usePostQuery("/summary", postRevision, postRequest<PostSummary>);
  const [postPending, setPostPending] = useState(false);
  const postMutation = useRef(false);
  const [releaseLogs, setReleaseLogs] = useState(initialReleaseLogs);
  const [settings, setSettings] = useState(initialSettings);
  const [friendsLinks, setFriendsLinks] = useState(initialFriendsLinks);
  const [comments, setComments] = useState(initialComments);
  const [notices, setNotices] = useState(initialNotices);
  const taxonomy = useTaxonomy();
  const taxonomyDisabled =
    taxonomy.taxonomyLoading || Boolean(taxonomy.taxonomyError) || taxonomy.taxonomyPending;
  const [panel, setPanel] = useState<AdminPanel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const commentDeleteFocus = useRef<{ deleted: boolean; fallback: HTMLElement | null }>({
    deleted: false,
    fallback: null,
  });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postDeleteTarget, setPostDeleteTarget] = useState<PostItem | null>(null);
  const [postDeleteError, setPostDeleteError] = useState("");
  const [postDeleteConflict, setPostDeleteConflict] = useState(false);
  const [media, setMedia] = useState(initialMedia);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const objectUrls = useRef(new Set<string>());
  const uploadPending = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const urls = objectUrls.current;
    return () => {
      mounted.current = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const uploadMedia = async (files: File[]) => {
    if (!files.length || uploadPending.current) return;
    uploadPending.current = true;
    setUploadingMedia(true);
    const added: MediaItem[] = [];
    const failed: string[] = [];
    for (const file of files) {
      if (!mounted.current) break;
      if (!file.type.startsWith("image/")) {
        failed.push(file.name);
        continue;
      }
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      try {
        const image = new window.Image();
        image.src = url;
        await image.decode();
        if (!mounted.current) break;
        added.push({
          id: crypto.randomUUID(),
          name: file.name,
          url,
          size:
            file.size < 1024 * 1024
              ? `${(file.size / 1024).toFixed(1)} KB`
              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          dimension: `${image.naturalWidth}×${image.naturalHeight}`,
          time: mediaUploadTime(),
          type: file.type,
          temporary: true,
        });
      } catch {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(url);
        failed.push(file.name);
      }
    }
    uploadPending.current = false;
    if (!mounted.current) return;
    setUploadingMedia(false);
    if (added.length) setMedia((current) => [...added, ...current]);
    setMessage(
      [
        added.length ? `已添加 ${added.length} 张本地图片（模拟，未上传服务器）` : "",
        failed.length ? `无法读取图片：${failed.join("、")}` : "",
      ]
        .filter(Boolean)
        .join("；"),
    );
  };

  const deleteMedia = (id: string) => {
    const item = media.find((candidate) => candidate.id === id);
    if (!item) return;
    if (item.temporary) {
      URL.revokeObjectURL(item.url);
      objectUrls.current.delete(item.url);
    }
    setMedia((current) => current.filter((candidate) => candidate.id !== id));
    setMessage("素材已移除（模拟，刷新后恢复初始数据）");
  };
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
      if (name === "compose") setEditingId(null);
      setPanel(name);
    },
    [router],
  );

  const openEditor = (id: string) => {
    if (postMutation.current) return;
    setEditingId(id);
    setPanel("compose");
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

  const approveComment = (id: string) => {
    setComments((current) =>
      current.map((comment) => (comment.id === id ? { ...comment, status: "已通过" } : comment)),
    );
    setMessage("评论已通过审核（模拟）");
  };

  const rejectComment = (id: string) => {
    setComments((current) =>
      current.map((comment) => (comment.id === id ? { ...comment, status: "已拒绝" } : comment)),
    );
    setMessage("评论已标记为垃圾（模拟）");
  };

  const replyComment = (id: string, content: string) => {
    const target = comments.find((comment) => comment.id === id);
    const cleanContent = content.trim();
    if (!target || !cleanContent) return false;
    setComments((current) => [
      {
        id: crypto.randomUUID(),
        author: "fuxiaochen（博主）",
        email: "admin@example.test",
        time: "刚刚",
        timestamp: new Date().toISOString(),
        content: `回复 @${target.author}：${cleanContent}`,
        status: "已通过",
        postTitle: target.postTitle,
        replyTo: target.id,
      },
      ...current,
    ]);
    setMessage("模拟回复已保存；未发送邮件或通知");
    return true;
  };

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

  const pendingCount = comments.filter((comment) => comment.status === "待审核").length;
  const unreadCount = notices.filter((notice) => !notice.read).length;
  const targetComment = comments.find((comment) => comment.id === deleteId);

  return (
    <AdminContext.Provider
      value={{
        settings,
        setSettings,
        releaseLogs,
        setReleaseLogs,
        friendsLinks,
        setFriendsLinks,
        media,
        onUploadMedia: uploadMedia,
        onDeleteMedia: deleteMedia,
        onMessage: setMessage,
        uploadingMedia,
        postRevision,
        postPending,
        postSummary: summary.data,
        postSummaryLoading: summary.loading,
        postSummaryError: summary.error,
        reloadPostSummary: summary.reload,
        savePost,
        cancelPostSchedule,
        comments,
        ...taxonomy,
        onOpen: openPanel,
        onEdit: openEditor,
        onDeletePost: (post) => {
          setPostDeleteTarget(post);
          setPostDeleteError("");
          setPostDeleteConflict(false);
        },
        onApprove: approveComment,
        onDeleteComment: (id, fallbackFocus) => {
          commentDeleteFocus.current = { deleted: false, fallback: fallbackFocus ?? null };
          setDeleteId(id);
        },
        onReject: rejectComment,
        onReply: replyComment,
        onBackup: () => setMessage("模拟备份已完成；未连接真实服务器"),
      }}
    >
      <AdminShell pendingCount={pendingCount} unreadCount={unreadCount} onOpen={openPanel}>
        {children}
      </AdminShell>
      {message && (
        <output className="admin-toast">
          {message}
          <button type="button" aria-label="关闭提示" onClick={() => setMessage("")}>
            <X size={14} />
          </button>
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
                    {["categories", "compose", "search", "schedule"].includes(panel)
                      ? "文章、分类与标签已持久化；暂未启用自动发布。"
                      : "此模块仍使用会话内演示数据。"}
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
              {panel === "compose" && (
                <PostEditor
                  key={editingId ?? "new"}
                  id={editingId}
                  onClose={() => setPanel(null)}
                />
              )}
              {panel === "notifications" && (
                <div className="admin-modal-section">
                  <div className="admin-modal-toolbar">
                    <span>{unreadCount} 条未读</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={unreadCount === 0}
                      onClick={() =>
                        setNotices((current) =>
                          current.map((notice) => ({ ...notice, read: true })),
                        )
                      }
                    >
                      全部已读
                    </Button>
                  </div>
                  <div className="admin-result-list">
                    {notices.map((notice) => (
                      <button
                        type="button"
                        className={`admin-notice ${notice.read ? "" : "is-unread"}`}
                        key={notice.id}
                        onClick={() =>
                          setNotices((current) =>
                            current.map((item) =>
                              item.id === notice.id ? { ...item, read: true } : item,
                            ),
                          )
                        }
                      >
                        <strong>{notice.title}</strong>
                        <span>{notice.detail}</span>
                        <small>
                          {notice.time} · {notice.read ? "已读" : "未读"}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                  <label htmlFor="admin-upload">选择本地图片</label>
                  <input
                    id="admin-upload"
                    className="admin-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingMedia}
                    onChange={(event) => {
                      const selected = Array.from(event.target.files ?? []);
                      event.target.value = "";
                      void uploadMedia(selected);
                    }}
                  />
                  <p className="admin-muted">
                    仅在当前会话预览，不会上传到服务器。刷新后恢复初始素材。
                  </p>
                  <output>
                    {uploadingMedia ? "正在读取图片…" : `当前媒体库共 ${media.length} 份素材`}
                  </output>
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
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
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
            确认从当前模拟页面移除 {targetComment?.author} 的评论。刷新页面后会恢复。
          </DialogDescription>
          <div className="admin-form-actions">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                commentDeleteFocus.current.deleted = true;
                setComments((current) => current.filter((comment) => comment.id !== deleteId));
                setDeleteId(null);
                setMessage("评论已删除（仅当前页面）");
              }}
            >
              确认删除
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
            永久删除《{postDeleteTarget?.title}》及其标签关联和文章排期，删除后无法恢复。
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
