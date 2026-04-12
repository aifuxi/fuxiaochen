"use client";

import React from "react";
import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryBodySchema,
  type CategoryDto,
  type CreateCategoryInput,
} from "@/lib/category/category-dto";

type CategoryFormDialogProps = NiceModalHocProps & {
  mode: "create" | "edit";
  category?: CategoryDto;
  onSubmit: (input: CreateCategoryInput) => Promise<void>;
};

const DEFAULT_COLOR = "#10B981";

export const CategoryFormDialog = NiceModal.create(
  ({ category, mode, onSubmit }: CategoryFormDialogProps) => {
    const modal = NiceModal.useModal();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [values, setValues] = React.useState(() => ({
      color: category?.color ?? DEFAULT_COLOR,
      description: category?.description ?? "",
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      sortOrder: String(category?.sortOrder ?? 0),
    }));
    const [hasEditedSlug, setHasEditedSlug] = React.useState(mode === "edit");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      const parsedValues = createCategoryBodySchema.safeParse({
        ...values,
        color: values.color.trim() || null,
      });

      if (!parsedValues.success) {
        toast.error(
          parsedValues.error.issues[0]?.message ?? "请检查输入内容。",
        );

        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit({
          ...parsedValues.data,
          color: parsedValues.data.color || null,
          description: parsedValues.data.description || null,
        });
        modal.remove();
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("保存分类失败。");
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
        <DialogContent
          className={`
            max-w-3xl rounded-4xl p-6
            sm:p-8
          `}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl">
              {mode === "create" ? "添加分类" : "编辑分类"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "创建一个主要文章分组，配置统一的编辑颜色。"
                : "更新分类元数据，无需离开当前列表。"}
            </DialogDescription>
          </DialogHeader>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div
              className={`
                grid gap-5
                sm:grid-cols-2
              `}
            >
              <Field label="名称">
                <Input
                  autoFocus
                  disabled={isSubmitting}
                  onChange={handleNameChange}
                  placeholder="设计系统"
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
                  placeholder="design-systems"
                  value={values.slug}
                />
              </Field>
            </div>

            <div
              className={`
                grid gap-5
                sm:grid-cols-[minmax(0,1fr)_160px]
              `}
            >
              <Field
                description="用于分类强调色的十六进制颜色值。"
                label="颜色"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 shrink-0 rounded-lg border border-white/10"
                    style={{
                      backgroundColor: normalizePreviewColor(values.color),
                    }}
                  />
                  <Input
                    disabled={isSubmitting}
                    onChange={(event) =>
                      setValues((currentValues) => ({
                        ...currentValues,
                        color: event.target.value,
                      }))
                    }
                    placeholder="#10B981"
                    value={values.color}
                  />
                </div>
              </Field>
              <Field
                description="值越小，在排序列表中越靠前。"
                label="排序顺序"
              >
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
            </div>

            <Field
              description="编辑者和内容策划的可选说明。"
              label="描述"
            >
              <Textarea
                disabled={isSubmitting}
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    description: event.target.value,
                  }))
                }
                placeholder="关于 Token、系统设计和组件治理的长文写作。"
                value={values.description}
              />
            </Field>

            <div className="flex justify-end gap-3">
              <Button
                disabled={isSubmitting}
                onClick={() => modal.remove()}
                type="button"
                variant="outline"
              >
                取消
              </Button>
              <Button disabled={isSubmitting} type="submit" variant="primary">
                {isSubmitting
                  ? mode === "create"
                    ? "保存中..."
                    : "更新中..."
                  : mode === "create"
                    ? "创建分类"
                    : "保存更改"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

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
      {description ? (
        <span className="block text-xs text-muted">{description}</span>
      ) : null}
    </label>
  );
}

function normalizePreviewColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim()) ? value.trim() : "#27272A";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
