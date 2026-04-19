"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { BlogDraft, CategoryRecord, TagRecord } from "../admin-types";

type BlogFormProps = {
  draft: BlogDraft;
  categories: CategoryRecord[];
  tags: TagRecord[];
  pending?: boolean;
  canDelete?: boolean;
  submitLabel?: string;
  deleteLabel?: string;
  onDraftChange: (field: string, value: string | boolean) => void;
  onToggleTag: (tagId: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
};

export function BlogForm({
  draft,
  categories,
  tags,
  pending = false,
  canDelete = false,
  submitLabel = "Save Post",
  deleteLabel = "Delete Post",
  onDraftChange,
  onToggleTag,
  onSubmit,
  onDelete,
}: BlogFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Title" name="title">
          <input
            className="ui-admin-input w-full px-4 py-3"
            name="title"
            type="text"
            value={draft.title}
            onChange={(event) => {
              onDraftChange("title", event.target.value);
            }}
          />
        </FormField>

        <FormField label="Slug" name="slug">
          <input
            className="ui-admin-input w-full px-4 py-3"
            name="slug"
            type="text"
            value={draft.slug}
            onChange={(event) => {
              onDraftChange("slug", event.target.value);
            }}
          />
        </FormField>
      </div>

      <FormField label="Description" name="description">
        <input
          className="ui-admin-input w-full px-4 py-3"
          name="description"
          type="text"
          value={draft.description}
          onChange={(event) => {
            onDraftChange("description", event.target.value);
          }}
        />
      </FormField>

      <FormField label="Cover" name="cover">
        <input
          className="ui-admin-input w-full px-4 py-3"
          name="cover"
          type="text"
          value={draft.cover}
          onChange={(event) => {
            onDraftChange("cover", event.target.value);
          }}
        />
      </FormField>

      <FormField label="Content" name="content">
        <textarea
          className="min-h-72 ui-admin-input w-full resize-y px-4 py-3"
          name="content"
          rows={14}
          value={draft.content}
          onChange={(event) => {
            onDraftChange("content", event.target.value);
          }}
        />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Category" name="categoryId">
          <select
            className="ui-admin-input w-full px-4 py-3"
            name="categoryId"
            value={draft.categoryId}
            onChange={(event) => {
              onDraftChange("categoryId", event.target.value);
            }}
          >
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Published At" name="publishedAt">
          <input
            className="ui-admin-input w-full px-4 py-3"
            name="publishedAt"
            type="datetime-local"
            value={draft.publishedAt}
            onChange={(event) => {
              onDraftChange("publishedAt", event.target.value);
            }}
          />
        </FormField>
      </div>

      <div className="space-y-3">
        <FormLabel htmlFor="blog-tags">Tags</FormLabel>
        <div
          className="rounded-control border border-white/8 bg-surface-2/80 p-4"
          id="blog-tags"
        >
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const checked = draft.tagIds.includes(tag.id);

                return (
                  <label
                    key={tag.id}
                    className={cn(
                      "ui-admin-chip cursor-pointer",
                      checked && "ui-admin-chip-active",
                    )}
                  >
                    <input
                      checked={checked}
                      className="sr-only"
                      type="checkbox"
                      onChange={() => {
                        onToggleTag(tag.id);
                      }}
                    />
                    {tag.name}
                  </label>
                );
              })
            ) : (
              <p className="text-sm text-text-muted">No tags available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center justify-between rounded-control border border-white/8 bg-surface-2/80 px-4 py-3 text-sm text-text-soft">
          <span>Published</span>
          <input
            checked={draft.published}
            className="size-4 accent-brand"
            name="published"
            type="checkbox"
            onChange={(event) => {
              onDraftChange("published", event.target.checked);
            }}
          />
        </label>

        <label className="flex items-center justify-between rounded-control border border-white/8 bg-surface-2/80 px-4 py-3 text-sm text-text-soft">
          <span>Featured</span>
          <input
            checked={draft.featured}
            className="size-4 accent-brand"
            name="featured"
            type="checkbox"
            onChange={(event) => {
              onDraftChange("featured", event.target.checked);
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <button
          className="ui-admin-button-primary"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : submitLabel}
        </button>

        {canDelete ? (
          <button
            className="ui-admin-button-danger"
            disabled={pending}
            type="button"
            onClick={onDelete}
          >
            {deleteLabel}
          </button>
        ) : (
          <span className="text-xs tracking-[0.18em] text-text-muted uppercase">
            Create mode
          </span>
        )}
      </div>
    </form>
  );
}

function FormField({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor={name}>{label}</FormLabel>
      {children}
    </div>
  );
}

function FormLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label
      className="text-xs tracking-[0.18em] text-text-muted uppercase"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
