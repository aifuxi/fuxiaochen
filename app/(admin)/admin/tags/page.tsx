"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import {
  AdminContentError,
  AdminContentLoading,
} from "@/components/admin/admin-loading-state";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminTag } from "@/lib/server/tags/mappers";

type TagFormState = {
  name: string;
  slug: string;
};

type TagDialogProps = {
  onSaved: () => Promise<unknown>;
  tag?: AdminTag;
};

const DEFAULT_TAG_FORM_STATE: TagFormState = {
  name: "",
  slug: "",
};

function getInitialTagFormState(tag?: AdminTag): TagFormState {
  if (!tag) {
    return DEFAULT_TAG_FORM_STATE;
  }

  return {
    name: tag.name,
    slug: tag.slug,
  };
}

function toTagPayload(formData: TagFormState) {
  return {
    name: formData.name.trim(),
    slug: formData.slug.trim(),
  };
}

const TagDialog = NiceModal.create(({ onSaved, tag }: TagDialogProps) => {
  const modal = NiceModal.useModal();
  const [formData, setFormData] = useState<TagFormState>(() =>
    getInitialTagFormState(tag),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(tag);

  function updateForm<Key extends keyof TagFormState>(
    key: Key,
    value: TagFormState[Key],
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submitTag() {
    const payload = toTagPayload(formData);

    if (!payload.name || !payload.slug) {
      setFormError("名称和 Slug 都不能为空。");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await apiRequest(tag ? `/api/admin/tags/${tag.id}` : "/api/admin/tags", {
        method: tag ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        toastOnError: false,
      });
      await onSaved();
      modal.remove();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "保存失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          modal.remove();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑标签" : "新建标签"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "更新标签名称和 Slug。" : "创建一个新的文章标签。"}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="py-2">
          <Field>
            <FieldLabel htmlFor="tag-name">名称</FieldLabel>
            <Input
              id="tag-name"
              value={formData.name}
              disabled={isSubmitting}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder="输入标签名称"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tag-slug">Slug</FieldLabel>
            <Input
              id="tag-slug"
              value={formData.slug}
              disabled={isSubmitting}
              onChange={(event) => updateForm("slug", event.target.value)}
              placeholder="nextjs"
            />
          </Field>
          {formError ? <FieldError>{formError}</FieldError> : null}
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => modal.remove()}
          >
            取消
          </Button>
          <Button disabled={isSubmitting} onClick={submitTag}>
            {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
            {isEditing ? "保存更改" : "创建标签"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default function AdminTagsPage() {
  const {
    data,
    error: tagsError,
    isLoading: areTagsLoading,
    mutate,
  } = useSWR<{ items: AdminTag[] }>(
    "/api/admin/tags?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const {
    data: blogsData,
    error: blogsError,
    isLoading: areBlogsLoading,
    mutate: mutateBlogs,
  } = useSWR<{ items: AdminBlog[] }>(
    "/api/admin/blogs?pageSize=100&sortBy=updatedAt&sortDirection=desc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const tags = data?.items ?? [];
  const blogs = blogsData?.items ?? [];
  const isLoading = areTagsLoading || areBlogsLoading;
  const error = tagsError ?? blogsError;
  const mostUsedTag = [...tags].sort((a, b) => b.blogCount - a.blogCount)[0];
  const averagePerPost =
    blogs.length === 0
      ? "0.0"
      : (
          blogs.reduce((sum, blog) => sum + blog.tags.length, 0) / blogs.length
        ).toFixed(1);

  const openTagDialog = (tag?: AdminTag) => {
    void NiceModal.show(TagDialog, {
      tag,
      onSaved: () => mutate(),
    });
  };

  const deleteTag = async (id: string) => {
    await apiRequest(`/api/admin/tags/${id}`, {
      method: "DELETE",
    });
    await mutate();
  };

  const confirmDeleteTag = (tag: AdminTag) => {
    void showAdminConfirmDialog({
      title: "确认删除这个标签？",
      description: `将删除标签「${tag.name}」。如果仍有文章使用该标签，接口会阻止删除。`,
      confirmingLabel: "正在删除...",
      onConfirm: () => deleteTag(tag.id),
    });
  };

  const retryLoading = () => {
    void mutate();
    void mutateBlogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签</h1>
          <p className="text-muted-foreground">更好地管理文章标签。</p>
        </div>
        <Button onClick={() => openTagDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          新建标签
        </Button>
      </div>

      <div className="rounded-lg border border-border p-6">
        {isLoading ? <AdminContentLoading label="正在加载标签..." /> : null}
        {!isLoading && error ? (
          <AdminContentError label="标签加载失败" onRetry={retryLoading} />
        ) : null}
        {!isLoading && !error && tags.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            暂无标签，先新建一个标签吧。
          </div>
        ) : null}
        {!isLoading && !error && tags.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex max-w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:border-primary/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tag.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {tag.slug}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {tag.blogCount}
                </Badge>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => openTagDialog(tag)}
                  >
                    <Pencil className="size-3.5" />
                    <span className="sr-only">编辑标签</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => confirmDeleteTag(tag)}
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">删除标签</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">标签总数</p>
          <p className="text-2xl font-bold">{tags.length}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">使用最多</p>
          <p className="truncate text-2xl font-bold">
            {mostUsedTag?.name ?? "无"}
          </p>
          {mostUsedTag ? (
            <p className="truncate font-mono text-xs text-muted-foreground">
              {mostUsedTag.slug}
            </p>
          ) : null}
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">平均每篇文章</p>
          <p className="text-2xl font-bold">{averagePerPost}</p>
        </div>
      </div>
    </div>
  );
}
