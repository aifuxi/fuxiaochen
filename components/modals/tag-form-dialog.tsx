"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTagBodySchema, type CreateTagInput, type TagDto } from "@/lib/tag/tag-dto";

type TagFormDialogProps = NiceModalHocProps & {
  mode: "create" | "edit";
  tag?: TagDto;
  onSubmit: (input: CreateTagInput) => Promise<void>;
};

export const TagFormDialog = NiceModal.create(({ mode, onSubmit, tag }: TagFormDialogProps) => {
  const modal = NiceModal.useModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState(() => ({
    description: tag?.description ?? "",
    name: tag?.name ?? "",
    slug: tag?.slug ?? "",
    sortOrder: String(tag?.sortOrder ?? 0),
  }));
  const [hasEditedSlug, setHasEditedSlug] = React.useState(mode === "edit");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createTagBodySchema.safeParse(values);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...parsedValues.data,
        description: parsedValues.data.description || null,
      });
      modal.remove();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save tag.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextName = event.target.value;

    setValues((currentValues) => {
      if (mode === "create" && !hasEditedSlug) {
        return {
          ...currentValues,
          name: nextName,
          slug: slugify(nextName),
        };
      }

      return {
        ...currentValues,
        name: nextName,
      };
    });
  }

  return (
    <Dialog open={modal.visible} onOpenChange={modal.remove}>
      <DialogContent className={`
        max-w-3xl rounded-[1.6rem] p-6
        sm:p-8
      `}>
        <DialogHeader>
          <DialogTitle className="text-3xl">{mode === "create" ? "Add Tag" : "Edit Tag"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a reusable label for filtering and organizing articles."
              : "Update tag details without leaving the current listing."}
          </DialogDescription>
        </DialogHeader>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className={`
            grid gap-5
            sm:grid-cols-2
          `}>
            <Field label="Name">
              <Input
                autoFocus
                disabled={isSubmitting}
                onChange={handleNameChange}
                placeholder="Next.js"
                value={values.name}
              />
            </Field>
            <Field label="Slug">
              <Input
                disabled={isSubmitting}
                onChange={(event) => {
                  setHasEditedSlug(true);
                  setValues((currentValues) => ({
                    ...currentValues,
                    slug: event.target.value,
                  }));
                }}
                placeholder="next-js"
                value={values.slug}
              />
            </Field>
          </div>

          <Field description="Lower values appear first in sorted lists." label="Sort Order">
            <Input
              disabled={isSubmitting}
              inputMode="numeric"
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  sortOrder: event.target.value,
                }))
              }
              placeholder="0"
              type="number"
              value={values.sortOrder}
            />
          </Field>

          <Field description="Optional short context for editors." label="Description">
            <Textarea
              disabled={isSubmitting}
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  description: event.target.value,
                }))
              }
              placeholder="Used for articles about the Next.js ecosystem."
              value={values.description}
            />
          </Field>

          <div className="flex justify-end gap-3">
            <Button disabled={isSubmitting} onClick={() => modal.remove()} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="primary">
              {isSubmitting ? (mode === "create" ? "Saving..." : "Updating...") : mode === "create" ? "Create Tag" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

function Field({
  children,
  description,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="type-label text-foreground">{label}</span>
      {children}
      {description ? <span className="block text-xs text-muted">{description}</span> : null}
    </label>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
