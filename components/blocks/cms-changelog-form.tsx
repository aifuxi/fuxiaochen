"use client";

import { ChangelogItemType } from "@/generated/prisma/enums";
import { Check, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ChangelogApiError,
  createChangelogRelease,
  getChangelogRelease,
  updateChangelogRelease,
} from "@/lib/changelog/changelog-client";
import type {
  ChangelogReleaseDto,
  CreateChangelogReleaseInput,
  UpdateChangelogReleaseInput,
} from "@/lib/changelog/changelog-dto";
import {
  createChangelogReleaseBodySchema,
  updateChangelogReleaseBodySchema,
} from "@/lib/changelog/changelog-dto";

type CmsChangelogFormProps = {
  releaseId?: string;
};

const ITEM_TYPE_OPTIONS = [
  { label: "Added", value: ChangelogItemType.Added },
  { label: "Improved", value: ChangelogItemType.Improved },
  { label: "Fixed", value: ChangelogItemType.Fixed },
  { label: "Changed", value: ChangelogItemType.Changed },
  { label: "Removed", value: ChangelogItemType.Removed },
];

export function CmsChangelogForm({ releaseId }: CmsChangelogFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(releaseId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<FormState>(createEmptyFormState());

  const { data: releaseData, isLoading } = useSWR(
    releaseId ? ["changelog-release-detail", releaseId] : null,
    () => getChangelogRelease(releaseId!),
  );

  React.useEffect(() => {
    if (!releaseData) {
      return;
    }

    setValues(createFormStateFromRelease(releaseData));
  }, [releaseData]);

  async function handleSubmit() {
    const payload = {
      isMajor: values.isMajor,
      items: values.items.map((item, index) => ({
        description: item.description || null,
        itemType: item.itemType,
        sortOrder: index,
        title: item.title,
      })),
      releasedOn: values.releasedOn,
      sortOrder: Number(values.sortOrder || 0),
      summary: values.summary || null,
      title: values.title,
      version: values.version,
    };

    const parsedValues = isEditMode
      ? updateChangelogReleaseBodySchema.safeParse(payload)
      : createChangelogReleaseBodySchema.safeParse(payload);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && releaseId) {
        await updateChangelogRelease(releaseId, parsedValues.data as UpdateChangelogReleaseInput);
        toast.success("Changelog release updated successfully.");
        router.refresh();
      } else {
        const release = await createChangelogRelease(parsedValues.data as CreateChangelogReleaseInput);
        toast.success("Changelog release created successfully.");
        router.replace(`/cms/changelog/${release.id}`);
      }
    } catch (error) {
      if (error instanceof ChangelogApiError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save changelog release.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className={`
        grid gap-6
        xl:grid-cols-[1fr_360px]
      `}>
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl border border-white/8 bg-white/4" />
          <div className="h-[720px] animate-pulse rounded-2xl border border-white/8 bg-white/4" />
        </div>
        <div className="h-[720px] animate-pulse rounded-2xl border border-white/8 bg-white/4" />
      </div>
    );
  }

  return (
    <div className={`
      grid gap-6
      xl:grid-cols-[1fr_360px]
    `}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <div className="border-b border-white/8 px-6 py-4 text-sm font-semibold">Release Metadata</div>
          <div className="space-y-5 p-6">
            <div className={`
              grid gap-5
              sm:grid-cols-2
            `}>
              <Field label="Version">
                <Input
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      version: event.target.value,
                    }))
                  }
                  placeholder="v1.2.0"
                  value={values.version}
                />
              </Field>
              <Field label="Released On">
                <Input
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      releasedOn: event.target.value,
                    }))
                  }
                  type="date"
                  value={values.releasedOn}
                />
              </Field>
            </div>

            <Field label="Title">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    title: event.target.value,
                  }))
                }
                placeholder="Spring release"
                value={values.title}
              />
            </Field>

            <Field label="Summary">
              <Textarea
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    summary: event.target.value,
                  }))
                }
                placeholder="Concise release summary for the changelog archive."
                value={values.summary}
              />
            </Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <div className="text-sm font-semibold">Release Items</div>
            <Button
              onClick={() =>
                setValues((currentValues) => ({
                  ...currentValues,
                  items: [...currentValues.items, createEmptyItemState()],
                }))
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-5 p-6">
            {values.items.length > 0 ? (
              values.items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-white/8 bg-white/3 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="muted">Item {index + 1}</Badge>
                    <Button
                      onClick={() =>
                        setValues((currentValues) => ({
                          ...currentValues,
                          items: currentValues.items.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className={`
                    grid gap-5
                    sm:grid-cols-[180px_minmax(0,1fr)]
                  `}>
                    <Field label="Type">
                      <Select
                        onValueChange={(value) =>
                          setValues((currentValues) => ({
                            ...currentValues,
                            items: currentValues.items.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...currentItem,
                                    itemType: value as ChangelogItemType,
                                  }
                                : currentItem,
                            ),
                          }))
                        }
                        options={ITEM_TYPE_OPTIONS}
                        value={item.itemType}
                      />
                    </Field>
                    <Field label="Title">
                      <Input
                        onChange={(event) =>
                          setValues((currentValues) => ({
                            ...currentValues,
                            items: currentValues.items.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...currentItem,
                                    title: event.target.value,
                                  }
                                : currentItem,
                            ),
                          }))
                        }
                        placeholder="Added project CRUD API"
                        value={item.title}
                      />
                    </Field>
                  </div>

                  <div className="mt-5">
                    <Field label="Description">
                      <Textarea
                        onChange={(event) =>
                          setValues((currentValues) => ({
                            ...currentValues,
                            items: currentValues.items.map((currentItem, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...currentItem,
                                    description: event.target.value,
                                  }
                                : currentItem,
                            ),
                          }))
                        }
                        placeholder="Optional extra detail for this changelog item."
                        value={item.description}
                      />
                    </Field>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-muted">
                No items yet. Add the first changelog item for this release.
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Check className="size-4" />
            {isEditMode ? "Editing existing release" : "Ready to publish"}
          </div>
          <div className="space-y-3">
            <Button
              className="w-full justify-center"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update Release" : "Create Release"}
            </Button>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="text-sm font-semibold">Release Settings</div>

          <label className={`
            flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-foreground
          `}>
            <Checkbox
              checked={values.isMajor}
              onCheckedChange={(checked) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  isMajor: Boolean(checked),
                }))
              }
            />
            <span>Mark as major release</span>
          </label>

          <Field label="Sort Order">
            <Input
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

          <div className="space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Badge variant={values.isMajor ? "success" : "muted"}>
                {values.isMajor ? "Major" : "Minor"}
              </Badge>
              <Badge variant="muted">{values.items.length} items</Badge>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

type FormState = {
  isMajor: boolean;
  items: ItemState[];
  releasedOn: string;
  sortOrder: string;
  summary: string;
  title: string;
  version: string;
};

type ItemState = {
  description: string;
  itemType: ChangelogItemType;
  title: string;
};

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

function createEmptyFormState(): FormState {
  return {
    isMajor: false,
    items: [createEmptyItemState()],
    releasedOn: "",
    sortOrder: "0",
    summary: "",
    title: "",
    version: "",
  };
}

function createEmptyItemState(): ItemState {
  return {
    description: "",
    itemType: ChangelogItemType.Added,
    title: "",
  };
}

function createFormStateFromRelease(release: ChangelogReleaseDto): FormState {
  return {
    isMajor: release.isMajor,
    items: release.items.map((item) => ({
      description: item.description ?? "",
      itemType: item.itemType,
      title: item.title,
    })),
    releasedOn: release.releasedOn.slice(0, 10),
    sortOrder: String(release.sortOrder),
    summary: release.summary ?? "",
    title: release.title,
    version: release.version,
  };
}
