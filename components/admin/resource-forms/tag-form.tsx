"use client";

import type { ReactNode } from "react";

import type { TagDraft } from "../admin-types";

type TagFormProps = {
  draft: TagDraft;
  pending?: boolean;
  canDelete?: boolean;
  submitLabel?: string;
  deleteLabel?: string;
  onDraftChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
};

export function TagForm({
  draft,
  pending = false,
  canDelete = false,
  submitLabel = "Save Tag",
  deleteLabel = "Delete Tag",
  onDraftChange,
  onSubmit,
  onDelete,
}: TagFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name" name="name">
          <input
            className="ui-admin-input w-full px-4 py-3"
            id="name"
            name="name"
            type="text"
            value={draft.name}
            onChange={(event) => {
              onDraftChange("name", event.target.value);
            }}
          />
        </FormField>

        <FormField label="Slug" name="slug">
          <input
            className="ui-admin-input w-full px-4 py-3"
            id="slug"
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
        <textarea
          className="min-h-40 ui-admin-input w-full resize-y px-4 py-3"
          id="description"
          name="description"
          rows={6}
          value={draft.description}
          onChange={(event) => {
            onDraftChange("description", event.target.value);
          }}
        />
      </FormField>

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
