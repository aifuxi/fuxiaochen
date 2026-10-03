"use client";
import { ArrowLeft, Maximize2, Minimize2, Settings2, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_POST_CONTENT } from "@/lib/posts/document";
import {
  postLocalTime,
  postSchema,
  postStatusLabels,
  type PostDetail,
  type PostStatus,
} from "@/lib/posts/schema";

import { useAdminWorkspace } from "./admin-context";
import { PostQueryStatus } from "./post-status";
import { TaxonomyStatus } from "./taxonomy-status";
import { AdminRequestError, postRequest, usePostQuery, usePostClock } from "./use-posts";

const BlockEditor = dynamic(
  () => import("./editor/block-editor").then((module) => module.BlockEditor),
  {
    ssr: false,
    loading: () => <output>正在载入编辑器…</output>,
  },
);

type Draft = {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
  scheduledTime: string;
};

function draftFrom(post: PostDetail | null): Draft {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    content: post?.content ?? EMPTY_POST_CONTENT,
    categoryId: post?.categoryId ?? "",
    tagIds: post?.tags.map((tag) => tag.id) ?? [],
    status: post?.status ?? "draft",
    scheduledTime: postLocalTime(post?.scheduledFor ?? null),
  };
}

const fieldIds: Record<string, string> = {
  title: "admin-post-title",
  content: "admin-post-body",
  slug: "admin-post-slug",
  categoryId: "admin-post-category",
  tagIds: "admin-post-tags",
  scheduledFor: "admin-post-publish-date",
};
const settingsKeys = ["slug", "categoryId", "tagIds", "status", "scheduledFor"];

export function PostEditor({ id }: { id: string | null }) {
  const router = useRouter();
  // 列表刷新不能卸载写作中的编辑器；只有显式重新载入才更新此查询。
  const query = usePostQuery(id ? `/${id}` : null, 0, postRequest<PostDetail>);
  if (id && !query.data)
    return (
      <div className="admin-post-editor-page">
        <Button variant="ghost" onClick={() => router.push("/admin/posts")}>
          <ArrowLeft size={16} aria-hidden="true" />
          返回文章列表
        </Button>
        <PostQueryStatus {...query} />
      </div>
    );
  return <PostEditorForm initial={query.data} reload={query.reload} />;
}

function PostEditorForm({ initial, reload }: { initial: PostDetail | null; reload: () => void }) {
  const router = useRouter();
  const now = usePostClock();
  const {
    categoryItems,
    tagItems,
    taxonomyLoading,
    taxonomyError,
    taxonomyPending,
    postPending,
    savePost,
    writingFocused,
    setWritingFocused,
  } = useAdminWorkspace();
  const [savedPost, setSavedPost] = useState(initial);
  const [draft, setDraft] = useState(() => draftFrom(initial));
  const [savedDraft, setSavedDraft] = useState(() => draftFrom(initial));
  const { title, slug, content, categoryId, tagIds, status, scheduledTime } = draft;
  const initialBody = initial?.content ?? EMPTY_POST_CONTENT;
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflict, setConflict] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [docked, setDocked] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const titleInput = useRef<HTMLTextAreaElement>(null);
  const settingsTrigger = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const resizeTitle = useCallback(() => {
    const input = titleInput.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, []);
  useEffect(() => {
    const page = host.current;
    const main = canvas.current;
    if (!page || !main) return undefined;
    let canvasWidth = -1;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === page) setDocked(entry.contentRect.width >= 1100);
        if (entry.target === main && entry.contentRect.width !== canvasWidth) {
          canvasWidth = entry.contentRect.width;
          resizeTitle();
        }
      }
    });
    observer.observe(page);
    observer.observe(main);
    return () => observer.disconnect();
  }, [resizeTitle]);
  useLayoutEffect(() => {
    if (titleInput.current?.value === title) resizeTitle();
  }, [title, resizeTitle]);
  const focusRequestedField = useCallback(() => {
    if (!focusField || postPending) return;
    const element = document.getElementById(fieldIds[focusField]);
    if (element) {
      element.focus();
      setFocusField(null);
    }
  }, [focusField, postPending]);
  useEffect(() => {
    if (!focusField || postPending) return undefined;
    const frame = requestAnimationFrame(focusRequestedField);
    return () => cancelAnimationFrame(frame);
  }, [focusField, postPending, focusRequestedField]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const onContentChange = useCallback((value: string) => {
    setDraft((current) => ({ ...current, content: value }));
  }, []);
  const onContentReady = useCallback((value: string) => {
    // 正文初始化规范化仅建立比较基线，不能标记为用户修改。
    setDraft((current) => ({ ...current, content: value }));
    setSavedDraft((current) => ({ ...current, content: value }));
  }, []);
  const taxonomyDisabled = taxonomyLoading || Boolean(taxonomyError) || taxonomyPending;
  const disabled = postPending || taxonomyDisabled;
  const dirty = !savedPost || JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const settingsError = settingsKeys.some((key) => Boolean(fieldErrors[key]));
  const settingsIncomplete =
    !slug.trim() || !categoryId || (status === "scheduled" && !scheduledTime);
  const saveLabel = postPending ? "保存中…" : "保存";
  const closeSettings = useCallback(() => {
    if (postPending) return;
    setSettingsOpen(false);
    setFocusField(null);
    if (docked) settingsTrigger.current?.focus();
  }, [docked, postPending]);
  useEffect(() => {
    if (!docked || !settingsOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        event.target instanceof Element &&
        event.target.closest("#post-settings-panel")
      ) {
        event.preventDefault();
        closeSettings();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [docked, settingsOpen, closeSettings]);
  const revealErrors = (fields: Record<string, string[]>) => {
    setFieldErrors(fields);
    const setting = Object.keys(fields).find((key) => settingsKeys.includes(key));
    if (setting) setSettingsOpen(true);
    setFocusField(setting ?? Object.keys(fields)[0] ?? null);
  };
  const fieldError = (field: string) =>
    fieldErrors[field] ? (
      <p className="admin-post-error" id={`post-error-${field}`} role="alert">
        {fieldErrors[field][0]}
      </p>
    ) : null;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    const scheduledFor =
      status === "scheduled" && scheduledTime
        ? Number.isFinite(Date.parse(`${scheduledTime}+08:00`))
          ? new Date(`${scheduledTime}+08:00`).toISOString()
          : "invalid"
        : null;
    const unchangedSchedule =
      savedPost?.status === "scheduled" && scheduledTime === postLocalTime(savedPost.scheduledFor);
    const parsed = postSchema.safeParse({
      title,
      slug,
      content,
      categoryId,
      tagIds,
      status,
      scheduledFor:
        status === "scheduled" && unchangedSchedule ? savedPost.scheduledFor : scheduledFor,
    });
    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0]);
        (fields[name] ??= []).push(issue.message);
      }
      revealErrors(fields);
      setError(parsed.error.issues[0].message);
      return;
    }
    if (
      status === "scheduled" &&
      !unchangedSchedule &&
      parsed.data.scheduledFor &&
      Date.parse(parsed.data.scheduledFor) <= Date.now()
    ) {
      const message = "请选择未来的发布时间（北京时间）。";
      revealErrors({ scheduledFor: [message] });
      setError(message);
      return;
    }
    setFieldErrors({});
    setError("");
    setConflict(false);
    try {
      const result = await savePost(parsed.data, savedPost);
      if (!mounted.current) return;
      const saved = { ...draftFrom(result), content: draft.content };
      setSavedPost(result);
      setDraft(saved);
      setSavedDraft(saved);
      if (!savedPost)
        router.replace(`/admin/posts/${encodeURIComponent(result.id)}/edit`, { scroll: false });
    } catch (failure) {
      if (!mounted.current) return;
      setError(failure instanceof Error ? failure.message : "保存失败，请重试。");
      if (failure instanceof AdminRequestError) {
        revealErrors(failure.fieldErrors);
        setConflict(failure.code === "VERSION_CONFLICT");
      }
    }
  };
  const settingsFields = (
    <div className="post-editor-settings-fields">
      <TaxonomyStatus />
      {!docked && error && (
        <p className="admin-post-error" role="alert">
          {error}
        </p>
      )}
      {!docked && conflict && (
        <Button
          type="button"
          variant="secondary"
          disabled={postPending}
          onClick={() => {
            setSettingsOpen(false);
            setConfirmReload(true);
          }}
        >
          重新载入最新内容
        </Button>
      )}
      <label htmlFor="admin-post-slug">
        文章 slug
        <Input
          form="article-writing-form"
          id="admin-post-slug"
          value={slug}
          maxLength={120}
          readOnly={Boolean(savedPost?.slugLockedAt)}
          disabled={postPending}
          onChange={(event) => update("slug", event.target.value)}
          aria-invalid={Boolean(fieldErrors.slug)}
          aria-describedby="post-slug-help post-error-slug"
        />
      </label>
      <p id="post-slug-help">
        链接：/posts/{slug || "your-article-slug"}。
        {savedPost?.slugLockedAt
          ? "首次发布后已锁定。"
          : "使用小写英文字母、数字和单个连字符，首次发布后锁定。"}
      </p>
      {fieldError("slug")}
      <label htmlFor="admin-post-category">分类</label>
      <Select
        value={categoryId}
        disabled={disabled || !categoryItems.length}
        onValueChange={(value) => update("categoryId", value ?? "")}
      >
        <SelectTrigger
          id="admin-post-category"
          aria-invalid={Boolean(fieldErrors.categoryId)}
          aria-describedby={fieldErrors.categoryId ? "post-error-categoryId" : undefined}
        >
          <SelectValue placeholder="请选择分类">
            {categoryItems.find((item) => item.id === categoryId)?.name ?? "请选择分类"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent data-cursor="native">
          {categoryItems.map((item) => (
            <SelectItem value={item.id} key={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldError("categoryId")}
      {!taxonomyLoading && !taxonomyError && !categoryItems.length && (
        <p>
          请先在{" "}
          <Link
            href="/admin/categories"
            aria-disabled={postPending || undefined}
            onClick={(event) => {
              if (postPending) event.preventDefault();
            }}
          >
            分类与标签
          </Link>{" "}
          创建分类。
        </p>
      )}
      <label htmlFor="admin-post-tags">标签</label>
      <Combobox
        multiple
        items={tagItems.map((item) => item.id)}
        value={tagIds}
        onValueChange={(value) => update("tagIds", value)}
        disabled={disabled}
        itemToStringLabel={(value: string) =>
          tagItems.find((tag) => tag.id === value)?.name ?? value
        }
      >
        <ComboboxInputGroup>
          <ComboboxInput
            id="admin-post-tags"
            placeholder="选择已有标签"
            aria-invalid={Boolean(fieldErrors.tagIds)}
            aria-describedby={fieldErrors.tagIds ? "post-error-tagIds" : undefined}
          />
          <ComboboxTrigger />
        </ComboboxInputGroup>
        <ComboboxContent data-cursor="native" emptyText="暂无匹配标签，请在分类与标签页创建">
          <ComboboxList>
            {(tagId: string) => (
              <ComboboxItem key={tagId} value={tagId}>
                {tagItems.find((tag) => tag.id === tagId)?.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {fieldError("tagIds")}
      <div aria-label="已选标签">
        {tagIds.map((tagId) => (
          <Button
            type="button"
            key={tagId}
            variant="ghost"
            size="sm"
            disabled={postPending}
            onClick={() =>
              update(
                "tagIds",
                tagIds.filter((id) => id !== tagId),
              )
            }
            aria-label={`移除标签 ${tagItems.find((tag) => tag.id === tagId)?.name ?? tagId}`}
          >
            {tagItems.find((tag) => tag.id === tagId)?.name ?? "标签已移除"}
            <X size={14} aria-hidden="true" />
          </Button>
        ))}
      </div>
      <fieldset className="admin-status-options" disabled={postPending}>
        <legend>文章状态</legend>
        {(["draft", "published", "scheduled"] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="post-status"
              checked={status === value}
              onChange={() => update("status", value)}
            />
            {postStatusLabels[value]}
          </label>
        ))}
      </fieldset>
      {status === "scheduled" && (
        <label htmlFor="admin-post-publish-date">
          计划发布时间（北京时间，到期后由调度任务发布）
          <Input
            form="article-writing-form"
            id="admin-post-publish-date"
            type="datetime-local"
            value={scheduledTime}
            disabled={postPending}
            onChange={(event) => update("scheduledTime", event.target.value)}
            aria-invalid={Boolean(fieldErrors.scheduledFor)}
            aria-describedby={fieldErrors.scheduledFor ? "post-error-scheduledFor" : undefined}
          />
        </label>
      )}
      {fieldError("scheduledFor")}
      {status === "scheduled" &&
        savedPost?.scheduledFor &&
        now !== null &&
        Date.parse(savedPost.scheduledFor) <= now && (
          <output>已到发布时间，等待调度任务执行。也可手动发布或调整排期。</output>
        )}
    </div>
  );
  const settingsHeader = (drawer: boolean) => (
    <div className="post-editor-settings-heading">
      {drawer ? <DialogTitle>文章设置</DialogTitle> : <h2 id="post-settings-title">文章设置</h2>}
      <Button
        type="button"
        variant="ghost"
        size="compact"
        aria-label="关闭文章设置"
        disabled={postPending}
        onClick={closeSettings}
      >
        <X size={18} aria-hidden="true" />
      </Button>
    </div>
  );
  return (
    <div className="admin-post-editor-page" ref={host} data-cursor="native">
      <form
        id="article-writing-form"
        className="post-editor-form"
        onSubmit={submit}
        noValidate
        aria-busy={postPending}
      >
        <div className="post-writing-bar" aria-label="写作操作">
          <div className="post-writing-bar-start">
            <Button
              type="button"
              variant="ghost"
              size="compact"
              disabled={postPending}
              onClick={() => router.push("/admin/posts")}
              aria-label="返回文章列表"
              title="返回文章列表"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="post-writing-back-label">返回</span>
            </Button>
            <output className="post-writing-save-status" aria-live="polite">
              {postPending ? "保存中" : dirty ? "未保存" : "已保存"}
            </output>
          </div>
          <div className="post-writing-bar-actions">
            <Button
              type="button"
              ref={settingsTrigger}
              variant="ghost"
              size="compact"
              aria-expanded={settingsOpen}
              aria-controls={settingsOpen ? "post-settings-panel" : undefined}
              disabled={postPending}
              onClick={() => (settingsOpen ? closeSettings() : setSettingsOpen(true))}
            >
              <Settings2 size={16} aria-hidden="true" />
              文章设置
              {(settingsError || settingsIncomplete) && (
                <span
                  className={
                    settingsError ? "post-writing-settings-error" : "post-writing-settings-hint"
                  }
                >
                  {settingsError ? "有错误" : "待完善"}
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="compact"
              aria-pressed={writingFocused}
              disabled={postPending}
              aria-label={writingFocused ? "退出专注模式" : "进入专注模式"}
              title={writingFocused ? "退出专注模式" : "进入专注模式"}
              onClick={() => setWritingFocused(!writingFocused)}
            >
              {writingFocused ? (
                <Minimize2 size={18} aria-hidden="true" />
              ) : (
                <Maximize2 size={18} aria-hidden="true" />
              )}
              <span className="post-writing-focus-label">
                {writingFocused ? "退出专注" : "专注"}
              </span>
            </Button>
            <Button type="submit" variant="primary" disabled={disabled}>
              {saveLabel}
            </Button>
          </div>
        </div>
        {error && (
          <p className="admin-post-error post-writing-feedback" role="alert">
            {error}
          </p>
        )}
        {conflict && (
          <Button
            type="button"
            variant="secondary"
            disabled={postPending}
            className="post-writing-feedback"
            onClick={() => setConfirmReload(true)}
          >
            重新载入最新内容
          </Button>
        )}
        {(taxonomyLoading || taxonomyError || (!taxonomyLoading && !categoryItems.length)) && (
          <div className="post-writing-feedback">
            <Button
              type="button"
              variant="ghost"
              disabled={postPending}
              onClick={() => setSettingsOpen(true)}
            >
              {taxonomyError
                ? "分类与标签加载失败，打开文章设置重试"
                : taxonomyLoading
                  ? "正在载入分类与标签…"
                  : "尚无分类，请打开文章设置创建"}
            </Button>
          </div>
        )}
        <div className={`post-writing-layout ${docked && settingsOpen ? "has-settings" : ""}`}>
          <div className="post-editor-main" ref={canvas}>
            <h1 className="sr-only">{savedPost ? "编辑文章" : "新建文章"}</h1>
            <label htmlFor="admin-post-title" className="sr-only">
              文章标题
            </label>
            <Textarea
              ref={titleInput}
              id="admin-post-title"
              className="post-writing-title"
              placeholder="文章标题"
              rows={1}
              value={title}
              maxLength={120}
              disabled={postPending}
              onChange={(event) => update("title", event.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "post-error-title" : undefined}
            />
            {fieldError("title")}
            <div id="admin-post-body-label" className="sr-only">
              正文内容
            </div>
            <BlockEditor
              initialContent={initialBody}
              onChange={onContentChange}
              onReady={onContentReady}
              disabled={postPending}
              invalid={Boolean(fieldErrors.content)}
              describedBy={fieldErrors.content ? "post-error-content" : undefined}
            />
            {fieldError("content")}
          </div>
          {docked && settingsOpen && (
            <aside
              id="post-settings-panel"
              className="post-editor-settings"
              aria-labelledby="post-settings-title"
            >
              {settingsHeader(false)}
              {settingsFields}
            </aside>
          )}
        </div>
      </form>
      <Dialog
        open={!docked && settingsOpen}
        onOpenChange={(open) => {
          if (!postPending) setSettingsOpen(open);
        }}
        onOpenChangeComplete={(open) => {
          if (open) focusRequestedField();
        }}
      >
        <DialogContent
          placement="right"
          data-cursor="native"
          id="post-settings-panel"
          className="post-settings-drawer"
          finalFocus={settingsTrigger}
          initialFocus={
            focusField ? () => document.getElementById(fieldIds[focusField]) : undefined
          }
        >
          {settingsHeader(true)}
          <DialogDescription className="sr-only">
            设置文章链接、分类、标签和发布计划。
          </DialogDescription>
          {settingsFields}
          <div className="post-settings-drawer-actions">
            <Button type="button" variant="ghost" disabled={postPending} onClick={closeSettings}>
              完成设置
            </Button>
            <Button type="submit" form="article-writing-form" variant="primary" disabled={disabled}>
              {saveLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmReload} onOpenChange={setConfirmReload}>
        <DialogContent className="admin-confirm" data-cursor="native">
          <DialogTitle>重新载入最新内容？</DialogTitle>
          <DialogDescription>这会替换当前未保存的草稿，请先复制需要保留的内容。</DialogDescription>
          <div className="admin-form-actions">
            <Button variant="ghost" onClick={() => setConfirmReload(false)}>
              保留草稿
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setConfirmReload(false);
                reload();
              }}
            >
              确认重新载入
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
