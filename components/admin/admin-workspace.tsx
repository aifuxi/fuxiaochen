"use client";

import { Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AdminContext } from "./admin-context";
import { AdminShell, type AdminPanel } from "./admin-shell";
import { initialReleaseLogs } from "./changelog-mock-data";
import { initialFriendsLinks } from "./friends-links-mock-data";
import {
  initialMedia,
  type MediaItem,
  initialComments,
  initialNotices,
  initialPosts,
  initialSchedules,
  initialSources,
  traffic30Days,
  type Post,
  type PostStatus,
  type Schedule,
} from "./mock-data";
import { initialSettings } from "./settings-mock-data";
import { TaxonomyStatus } from "./taxonomy-status";
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

function isFuturePublishDate(value: string) {
  const timestamp = Date.parse(`${value}+08:00`);
  return Number.isFinite(timestamp) && timestamp > Date.now();
}

function mediaUploadTime() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).slice(0, 16);
}

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [releaseLogs, setReleaseLogs] = useState(initialReleaseLogs);
  const [settings, setSettings] = useState(initialSettings);
  const [friendsLinks, setFriendsLinks] = useState(initialFriendsLinks);
  const [comments, setComments] = useState(initialComments);
  const [manualSchedules, setSchedules] = useState(initialSchedules);
  const [notices, setNotices] = useState(initialNotices);
  const taxonomy = useTaxonomy();
  const categories = taxonomy.categoryItems.map((item) => item.name);
  const taxonomyDisabled =
    taxonomy.taxonomyLoading || Boolean(taxonomy.taxonomyError) || taxonomy.taxonomyPending;
  const [panel, setPanel] = useState<AdminPanel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const commentDeleteFocus = useRef<{ deleted: boolean; fallback: HTMLElement | null }>({
    deleted: false,
    fallback: null,
  });
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [postStatus, setPostStatus] = useState<PostStatus>("草稿");
  const [tags, setTags] = useState<string[]>([]);
  const [publishDate, setPublishDate] = useState("");
  const [postDeleteId, setPostDeleteId] = useState<string | null>(null);
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
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

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
      if (name === "compose") {
        setEditingId(null);
        setTitle("");
        setBody("");
        setCategory("");
        setPostStatus("草稿");
        setTags([]);
        setPublishDate("");
      }
      setPanel(name);
    },
    [router],
  );

  const openEditor = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setBody(post.content);
    setCategory(post.category);
    setPostStatus(post.status);
    setTags(post.tags);
    setPublishDate(post.scheduledFor ?? "");
    setPanel("compose");
  };

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    return posts.filter((post) =>
      [post.title, post.content, post.category, ...post.tags].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }, [posts, query]);

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

  const savePost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const dateValue = new FormData(event.currentTarget).get("publish-date");
    const nextPublishDate = typeof dateValue === "string" ? dateValue : "";
    if (!cleanTitle || !cleanBody) {
      setMessage("标题和正文不能只包含空格");
      return;
    }
    if (postStatus === "已排期" && !isFuturePublishDate(nextPublishDate)) {
      setMessage("请选择未来的发布时间（北京时间）");
      return;
    }
    if (taxonomyDisabled || !categories.includes(category)) {
      setMessage("请选择已登记的分类；没有分类时请先创建。");
      return;
    }
    if (tags.some((name) => !taxonomy.tagItems.some((item) => item.name === name))) {
      setMessage("请移除历史演示标签或重新选择已登记的标签。");
      return;
    }
    const cleanTags = [...new Set(tags)];
    const scheduledFor = postStatus === "已排期" ? nextPublishDate : undefined;
    if (editingId) {
      setPosts((current) =>
        current.map((post) =>
          post.id === editingId
            ? {
                ...post,
                title: cleanTitle,
                content: cleanBody,
                category,
                status: postStatus,
                tags: cleanTags,
                scheduledFor,
                views: postStatus === "已发布" ? (post.views ?? 0) : null,
              }
            : post,
        ),
      );
    } else {
      setPosts((current) => [
        {
          id: crypto.randomUUID(),
          title: cleanTitle,
          content: cleanBody,
          category,
          tags: cleanTags,
          scheduledFor,
          views: postStatus === "已发布" ? 0 : null,
          status: postStatus,
          date: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" }),
        },
        ...current,
      ]);
    }
    setPanel(null);
    setMessage(editingId ? "文章已更新（仅当前页面）" : "文章已创建（仅当前页面）");
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

  const addSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const titleValue = form.get("title");
    const dateValue = form.get("date");
    const nextTitle = typeof titleValue === "string" ? titleValue.trim() : "";
    const nextDate = typeof dateValue === "string" ? dateValue : "";
    if (!nextTitle || !nextDate) return;
    setSchedules((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: nextTitle,
        date: nextDate.replace("T", " "),
      },
    ]);
    setScheduleTitle("");
    setScheduleDate("");
    setMessage("计划已添加（仅当前页面）");
  };

  const schedules: Schedule[] = [
    ...manualSchedules,
    ...posts
      .filter((post) => post.status === "已排期" && post.scheduledFor)
      .map((post) => ({
        id: post.id,
        title: post.title,
        date: post.scheduledFor!.replace("T", " "),
      })),
  ].toSorted((a, b) => a.date.localeCompare(b.date));
  const targetPost = posts.find((post) => post.id === postDeleteId);

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
        posts,
        comments,
        schedules,
        categories,
        ...taxonomy,
        onOpen: openPanel,
        onEdit: openEditor,
        onDeletePost: setPostDeleteId,
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
          if (!open) setPanel(null);
        }}
      >
        <DialogContent className="admin-modal">
          {panel && (
            <>
              <div className="admin-modal-heading">
                <div>
                  <DialogTitle>{panelTitles[panel]}</DialogTitle>
                  <DialogDescription>
                    {panel === "categories"
                      ? "分类与标签已持久化；文章关联尚未接入。"
                      : "文章及其他操作仍使用会话内演示数据。"}
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="sm" aria-label="关闭" onClick={() => setPanel(null)}>
                  <X size={18} />
                </Button>
              </div>
              {panel === "search" && (
                <div className="admin-modal-section">
                  <label htmlFor="admin-search-input">搜索文章标题、正文、标签和分类</label>
                  <InputGroup>
                    <InputGroupInput
                      id="admin-search-input"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="输入关键词…"
                    />
                    <InputGroupAddon>
                      <Search size={16} aria-hidden="true" />
                    </InputGroupAddon>
                  </InputGroup>
                  <div className="admin-result-list">
                    {!query.trim() ? (
                      <p className="admin-empty">输入关键词开始搜索。</p>
                    ) : filteredPosts.length ? (
                      filteredPosts.map((post) => (
                        <button
                          className="admin-result"
                          type="button"
                          key={post.id}
                          onClick={() => openEditor(post)}
                        >
                          <strong>{post.title}</strong>
                          <span>
                            {post.category} · {post.status} · {post.date}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="admin-empty">没有找到相关文章。</p>
                    )}
                  </div>
                </div>
              )}
              {panel === "compose" && (
                <form className="admin-form" onSubmit={savePost}>
                  <TaxonomyStatus />
                  <label htmlFor="admin-post-title">
                    文章标题
                    <Input
                      id="admin-post-title"
                      required
                      maxLength={120}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="输入标题"
                    />
                  </label>
                  <label htmlFor="admin-post-body">
                    正文内容
                    <Textarea
                      id="admin-post-body"
                      required
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="开始写作…"
                    />
                  </label>
                  <label htmlFor="admin-post-category">
                    分类
                    <Select
                      value={category}
                      disabled={taxonomyDisabled || !categories.length}
                      onValueChange={(value) => setCategory(value ?? "")}
                    >
                      <SelectTrigger id="admin-post-category">
                        <SelectValue placeholder="请选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((item) => (
                          <SelectItem value={item} key={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  {category && !categories.includes(category) && (
                    <p role="alert">历史演示分类“{category}”未登记，请重新选择。</p>
                  )}
                  {!taxonomy.taxonomyLoading && !taxonomy.taxonomyError && !categories.length && (
                    <p>
                      请先在 <Link href="/admin/categories">分类与标签</Link> 创建分类。
                    </p>
                  )}
                  <label htmlFor="admin-post-tags">标签</label>
                  <Combobox
                    multiple
                    items={taxonomy.tagItems.map((item) => item.name)}
                    value={tags}
                    onValueChange={setTags}
                    disabled={taxonomyDisabled}
                  >
                    <ComboboxInputGroup>
                      <ComboboxInput id="admin-post-tags" placeholder="选择已有标签" />
                      <ComboboxTrigger />
                    </ComboboxInputGroup>
                    <ComboboxContent emptyText="暂无匹配标签，请在分类与标签页创建">
                      <ComboboxList>
                        {(name: string) => (
                          <ComboboxItem key={name} value={name}>
                            {name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <div aria-label="已选标签">
                    {tags.map((name) => (
                      <Button
                        type="button"
                        key={name}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setTags((current) => current.filter((item) => item !== name))
                        }
                        aria-label={`移除标签 ${name}`}
                      >
                        {name}
                        {!taxonomy.tagItems.some((item) => item.name === name) &&
                          "（历史演示值，未登记）"}
                        <X size={14} aria-hidden="true" />
                      </Button>
                    ))}
                  </div>
                  <fieldset className="admin-status-options">
                    <legend>文章状态</legend>
                    <label>
                      <input
                        type="radio"
                        name="post-status"
                        checked={postStatus === "草稿"}
                        onChange={() => setPostStatus("草稿")}
                      />
                      草稿
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="post-status"
                        checked={postStatus === "已发布"}
                        onChange={() => setPostStatus("已发布")}
                      />
                      已发布
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="post-status"
                        checked={postStatus === "已排期"}
                        onChange={() => setPostStatus("已排期")}
                      />
                      已排期
                    </label>
                  </fieldset>
                  {postStatus === "已排期" && (
                    <label htmlFor="admin-post-publish-date">
                      计划发布时间（北京时间，仅模拟，不会自动发布）
                      <Input
                        id="admin-post-publish-date"
                        name="publish-date"
                        type="datetime-local"
                        required
                        value={publishDate}
                        onChange={(event) => setPublishDate(event.target.value)}
                      />
                    </label>
                  )}
                  <div className="admin-form-actions">
                    <Button type="button" variant="ghost" onClick={() => setPanel(null)}>
                      取消
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={taxonomyDisabled || !categories.length}
                    >
                      {editingId ? "保存修改" : "创建文章"}
                    </Button>
                  </div>
                </form>
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
                        <small>关联数量尚未接入</small>
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
                    {!taxonomyDisabled && !categories.length && <p>暂无分类，请先添加分类。</p>}
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
              {panel === "schedule" && (
                <div className="admin-modal-section">
                  <form className="admin-form" onSubmit={addSchedule}>
                    <label htmlFor="admin-schedule-title">
                      文章标题
                      <Input
                        id="admin-schedule-title"
                        name="title"
                        value={scheduleTitle}
                        onChange={(event) => setScheduleTitle(event.target.value)}
                        required
                        placeholder="输入排期文章标题"
                      />
                    </label>
                    <label htmlFor="admin-schedule-date">
                      计划发布时间
                      <Input
                        id="admin-schedule-date"
                        name="date"
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(event) => setScheduleDate(event.target.value)}
                        required
                      />
                    </label>
                    <Button type="submit" variant="primary">
                      添加计划
                    </Button>
                  </form>
                  <div className="admin-result-list">
                    {schedules.map((schedule: Schedule) => (
                      <div className="admin-managed-row" key={schedule.id}>
                        <div>
                          <strong>{schedule.title}</strong>
                          <small>{schedule.date}</small>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`移除计划 ${schedule.title}`}
                          onClick={() => {
                            setSchedules((current) =>
                              current.filter((item) => item.id !== schedule.id),
                            );
                            setPosts((current) =>
                              current.map((post) =>
                                post.id === schedule.id
                                  ? { ...post, status: "草稿", scheduledFor: undefined }
                                  : post,
                              ),
                            );
                            setMessage("计划已移除（仅当前页面）");
                          }}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        open={postDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPostDeleteId(null);
        }}
      >
        <DialogContent className="admin-confirm">
          <DialogTitle>删除文章？</DialogTitle>
          <DialogDescription>
            确认移除《{targetPost?.title}》及其文章排期。仅影响当前模拟会话，刷新后恢复。
          </DialogDescription>
          <div className="admin-form-actions">
            <Button variant="ghost" onClick={() => setPostDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setPosts((current) => current.filter((post) => post.id !== postDeleteId));
                setPostDeleteId(null);
                setMessage("文章已删除（仅当前页面）");
              }}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminContext.Provider>
  );
}
