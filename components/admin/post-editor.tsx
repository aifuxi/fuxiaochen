"use client";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

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

type Props = { id: string | null; onClose: () => void };
export function PostEditor({ id, onClose }: Props) {
  const { postRevision } = useAdminWorkspace();
  const query = usePostQuery(id ? `/${id}` : null, postRevision, postRequest<PostDetail>);
  if (id && !query.data) return <PostQueryStatus {...query} />;
  return (
    <PostEditorForm
      key={`${id ?? "new"}|${query.data?.version ?? 0}`}
      initial={query.data}
      onClose={onClose}
      reload={query.reload}
    />
  );
}
function PostEditorForm({
  initial,
  onClose,
  reload,
}: {
  initial: PostDetail | null;
  onClose: () => void;
  reload: () => void;
}) {
  const now = usePostClock();
  const {
    categoryItems,
    tagItems,
    taxonomyLoading,
    taxonomyError,
    taxonomyPending,
    postPending,
    savePost,
  } = useAdminWorkspace();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [tagIds, setTagIds] = useState(initial?.tags.map((tag) => tag.id) ?? []);
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "draft");
  const [scheduledTime, setScheduledTime] = useState(postLocalTime(initial?.scheduledFor ?? null));
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [conflict, setConflict] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const taxonomyDisabled = taxonomyLoading || Boolean(taxonomyError) || taxonomyPending;
  const disabled = postPending || taxonomyDisabled;
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
      initial?.status === "scheduled" && scheduledTime === postLocalTime(initial.scheduledFor);
    const parsed = postSchema.safeParse({
      title,
      slug,
      content,
      categoryId,
      tagIds,
      status,
      scheduledFor:
        status === "scheduled" && unchangedSchedule ? initial.scheduledFor : scheduledFor,
    });
    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const name = String(issue.path[0]);
        (fields[name] ??= []).push(issue.message);
      }
      setFieldErrors(fields);
      setError(parsed.error.issues[0].message);
      return;
    }
    setFieldErrors({});
    setError("");
    setConflict(false);
    try {
      await savePost(parsed.data, initial);
      onClose();
    } catch (failure) {
      if (!mounted.current) return;
      setError(failure instanceof Error ? failure.message : "保存失败，请重试。");
      if (failure instanceof AdminRequestError) {
        setFieldErrors(failure.fieldErrors);
        setConflict(failure.code === "VERSION_CONFLICT");
      }
    }
  };
  return (
    <>
      <form className="admin-form" onSubmit={submit} noValidate aria-busy={postPending}>
        <TaxonomyStatus />
        {error && (
          <p className="admin-post-error" role="alert">
            {error}
          </p>
        )}
        {conflict && (
          <Button
            type="button"
            variant="secondary"
            disabled={postPending}
            onClick={() => setConfirmReload(true)}
          >
            重新载入最新内容
          </Button>
        )}
        <label htmlFor="admin-post-title">
          文章标题
          <Input
            id="admin-post-title"
            value={title}
            maxLength={120}
            disabled={postPending}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "post-error-title" : undefined}
          />
        </label>
        {fieldError("title")}
        <label htmlFor="admin-post-slug">
          文章 slug
          <Input
            id="admin-post-slug"
            value={slug}
            maxLength={120}
            readOnly={Boolean(initial?.slugLockedAt)}
            disabled={postPending}
            onChange={(event) => setSlug(event.target.value)}
            aria-invalid={Boolean(fieldErrors.slug)}
            aria-describedby="post-slug-help post-error-slug"
          />
        </label>
        <p id="post-slug-help">
          链接：/posts/{slug || "your-article-slug"}。
          {initial?.slugLockedAt
            ? "首次发布后已锁定。"
            : "使用小写英文字母、数字和单个连字符，首次发布后锁定。"}
        </p>
        {fieldError("slug")}
        <label htmlFor="admin-post-body">
          正文内容（Markdown）
          <Textarea
            id="admin-post-body"
            value={content}
            maxLength={100_000}
            disabled={postPending}
            onChange={(event) => setContent(event.target.value)}
            aria-invalid={Boolean(fieldErrors.content)}
            aria-describedby={fieldErrors.content ? "post-error-content" : undefined}
          />
        </label>
        <p>支持 Markdown 标题、列表、链接、代码块和表格；原始 HTML 按文本显示。</p>
        {fieldError("content")}
        <label htmlFor="admin-post-category">分类</label>
        <Select
          value={categoryId}
          disabled={disabled || !categoryItems.length}
          onValueChange={(value) => setCategoryId(value ?? "")}
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
          <SelectContent>
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
            请先在 <Link href="/admin/categories">分类与标签</Link> 创建分类。
          </p>
        )}
        <label htmlFor="admin-post-tags">标签</label>
        <Combobox
          multiple
          items={tagItems.map((item) => item.id)}
          value={tagIds}
          onValueChange={setTagIds}
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
          <ComboboxContent emptyText="暂无匹配标签，请在分类与标签页创建">
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
              onClick={() => setTagIds((current) => current.filter((id) => id !== tagId))}
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
                onChange={() => setStatus(value)}
              />
              {postStatusLabels[value]}
            </label>
          ))}
        </fieldset>
        {status === "scheduled" && (
          <label htmlFor="admin-post-publish-date">
            计划发布时间（北京时间，到期后需手动发布）
            <Input
              id="admin-post-publish-date"
              type="datetime-local"
              value={scheduledTime}
              disabled={postPending}
              onChange={(event) => setScheduledTime(event.target.value)}
              aria-invalid={Boolean(fieldErrors.scheduledFor)}
              aria-describedby={fieldErrors.scheduledFor ? "post-error-scheduledFor" : undefined}
            />
          </label>
        )}
        {fieldError("scheduledFor")}
        {status === "scheduled" &&
          initial?.scheduledFor &&
          now !== null &&
          Date.parse(initial.scheduledFor) <= now && (
            <output>原排期已过期，文章仍未自动发布。可保留时间编辑其他字段，或调整排期。</output>
          )}
        <div className="admin-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={postPending}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={disabled || !categoryItems.length}>
            {postPending ? "正在保存…" : initial ? "保存修改" : "创建文章"}
          </Button>
        </div>
      </form>
      <Dialog open={confirmReload} onOpenChange={setConfirmReload}>
        <DialogContent className="admin-confirm">
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
    </>
  );
}
