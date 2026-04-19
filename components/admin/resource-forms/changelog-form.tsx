"use client";

import type { ReactNode } from "react";

import type { ChangelogDraft } from "../admin-types";

type ChangelogFormProps = {
  draft: ChangelogDraft;
  pending?: boolean;
  canDelete?: boolean;
  submitLabel?: string;
  deleteLabel?: string;
  onDraftChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
};

export function ChangelogForm({
  draft,
  pending = false,
  canDelete = false,
  submitLabel = "Save Entry",
  deleteLabel = "Delete Entry",
  onDraftChange,
  onSubmit,
  onDelete,
}: ChangelogFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Version" name="version">
          <input
            className="ui-admin-input w-full px-4 py-3"
            id="version"
            name="version"
            type="text"
            value={draft.version}
            onChange={(event) => {
              onDraftChange("version", event.target.value);
            }}
          />
        </FormField>

        <FormField label="Release Date" name="releaseDate">
          <input
            className="ui-admin-input w-full px-4 py-3"
            id="releaseDate"
            name="releaseDate"
            type="date"
            value={draft.releaseDate}
            onChange={(event) => {
              onDraftChange("releaseDate", event.target.value);
            }}
          />
        </FormField>
      </div>

      <FormField label="Content" name="content">
        <textarea
          className="min-h-72 ui-admin-input w-full resize-y px-4 py-3"
          id="content"
          name="content"
          rows={14}
          value={draft.content}
          onChange={(event) => {
            onDraftChange("content", event.target.value);
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
