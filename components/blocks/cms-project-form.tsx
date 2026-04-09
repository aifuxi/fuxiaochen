"use client";

import { ProjectCategory } from "@/generated/prisma/enums";
import { Check } from "lucide-react";
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
  createProject,
  getProject,
  ProjectApiError,
  updateProject,
} from "@/lib/project/project-client";
import type { CreateProjectInput, ProjectDto, UpdateProjectInput } from "@/lib/project/project-dto";
import { createProjectBodySchema, updateProjectBodySchema } from "@/lib/project/project-dto";

type CmsProjectFormProps = {
  projectId?: string;
};

const PROJECT_CATEGORY_OPTIONS = [
  { label: "Web", value: ProjectCategory.Web },
  { label: "Design", value: ProjectCategory.Design },
  { label: "Mobile", value: ProjectCategory.Mobile },
  { label: "Open Source", value: ProjectCategory.OpenSource },
];

export function CmsProjectForm({ projectId }: CmsProjectFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(projectId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<FormState>(createEmptyFormState());
  const [hasEditedSlug, setHasEditedSlug] = React.useState(isEditMode);

  const { data: projectData, isLoading } = useSWR(
    projectId ? ["project-detail", projectId] : null,
    () => getProject(projectId!),
  );

  React.useEffect(() => {
    if (!projectData) {
      return;
    }

    setValues(createFormStateFromProject(projectData));
  }, [projectData]);

  async function handleSubmit() {
    const payload = {
      badgeLabel: values.badgeLabel || null,
      category: values.category,
      coverAssetId: values.coverAssetId || null,
      detail: values.detail || null,
      externalUrl: values.externalUrl || null,
      isFeatured: values.isFeatured,
      metricLabel: values.metricLabel || null,
      metricValue: values.metricValue || null,
      name: values.name,
      publishedAt: values.publishedAt || null,
      slug: values.slug,
      sortOrder: Number(values.sortOrder || 0),
      sourceUrl: values.sourceUrl || null,
      summary: values.summary,
      techNames: values.techNames
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const parsedValues = isEditMode
      ? updateProjectBodySchema.safeParse(payload)
      : createProjectBodySchema.safeParse(payload);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && projectId) {
        await updateProject(projectId, parsedValues.data as UpdateProjectInput);
        toast.success("Project updated successfully.");
        router.refresh();
      } else {
        const project = await createProject(parsedValues.data as CreateProjectInput);
        toast.success("Project created successfully.");
        router.replace(`/cms/project/${project.id}`);
      }
    } catch (error) {
      if (error instanceof ProjectApiError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save project.");
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
          <div className="h-64 animate-pulse rounded-2xl border border-white/8 bg-white/4" />
          <div className="h-96 animate-pulse rounded-2xl border border-white/8 bg-white/4" />
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
          <div className="border-b border-white/8 px-6 py-4 text-sm font-semibold">Identity</div>
          <div className="space-y-5 p-6">
            <Field label="Project Name">
              <Input
                onChange={(event) => {
                  const nextName = event.target.value;

                  setValues((currentValues) => {
                    if (!hasEditedSlug) {
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
                }}
                placeholder="StreamLine"
                value={values.name}
              />
            </Field>

            <div className={`
              grid gap-5
              sm:grid-cols-2
            `}>
              <Field label="Slug">
                <Input
                  onChange={(event) => {
                    setHasEditedSlug(true);
                    setValues((currentValues) => ({
                      ...currentValues,
                      slug: event.target.value,
                    }));
                  }}
                  placeholder="streamline"
                  value={values.slug}
                />
              </Field>
              <Field label="Category">
                <Select
                  onValueChange={(value) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      category: value as ProjectCategory,
                    }))
                  }
                  options={PROJECT_CATEGORY_OPTIONS}
                  value={values.category}
                />
              </Field>
            </div>

            <Field description="Short portfolio summary for cards and listings." label="Summary">
              <Textarea
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    summary: event.target.value,
                  }))
                }
                placeholder="Project management for modern teams."
                value={values.summary}
              />
            </Field>

            <Field description="Optional longer project description." label="Detail">
              <Textarea
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    detail: event.target.value,
                  }))
                }
                placeholder="Longer product story, scope, and outcome."
                value={values.detail}
              />
            </Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/3">
          <div className="border-b border-white/8 px-6 py-4 text-sm font-semibold">Links & Assets</div>
          <div className={`
            grid gap-5 p-6
            sm:grid-cols-2
          `}>
            <Field label="External URL">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    externalUrl: event.target.value,
                  }))
                }
                placeholder="https://example.com"
                value={values.externalUrl}
              />
            </Field>
            <Field label="Source URL">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    sourceUrl: event.target.value,
                  }))
                }
                placeholder="https://github.com/example/repo"
                value={values.sourceUrl}
              />
            </Field>
            <Field description="Optional media asset id from uploads." label="Cover Asset ID">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    coverAssetId: event.target.value,
                  }))
                }
                placeholder="cm..."
                value={values.coverAssetId}
              />
            </Field>
            <Field label="Published At">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    publishedAt: event.target.value,
                  }))
                }
                type="datetime-local"
                value={values.publishedAt}
              />
            </Field>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Check className="size-4" />
            {isEditMode ? "Editing existing project" : "Ready to publish"}
          </div>
          <div className="space-y-3">
            <Button
              className="w-full justify-center"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="text-sm font-semibold">Display Settings</div>

          <label className={`
            flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-foreground
          `}>
            <Checkbox
              checked={values.isFeatured}
              onCheckedChange={(checked) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  isFeatured: Boolean(checked),
                }))
              }
            />
            <span>Feature this project</span>
          </label>

          <div className={`
            grid gap-5
            sm:grid-cols-2
            xl:grid-cols-1
          `}>
            <Field label="Badge Label">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    badgeLabel: event.target.value,
                  }))
                }
                placeholder="Productivity"
                value={values.badgeLabel}
              />
            </Field>
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
          </div>

          <div className={`
            grid gap-5
            sm:grid-cols-2
            xl:grid-cols-1
          `}>
            <Field label="Metric Label">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    metricLabel: event.target.value,
                  }))
                }
                placeholder="Teams"
                value={values.metricLabel}
              />
            </Field>
            <Field label="Metric Value">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    metricValue: event.target.value,
                  }))
                }
                placeholder="1.2k"
                value={values.metricValue}
              />
            </Field>
          </div>

          <Field description="Comma-separated technology names." label="Technologies">
            <Textarea
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  techNames: event.target.value,
                }))
              }
              placeholder="Svelte, Supabase, Tailwind CSS"
              value={values.techNames}
            />
          </Field>

          <div className="space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Badge variant="muted">{formatCategoryLabel(values.category)}</Badge>
              <Badge variant={values.isFeatured ? "success" : "muted"}>
                {values.isFeatured ? "Featured" : "Standard"}
              </Badge>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

type FormState = {
  badgeLabel: string;
  category: ProjectCategory;
  coverAssetId: string;
  detail: string;
  externalUrl: string;
  isFeatured: boolean;
  metricLabel: string;
  metricValue: string;
  name: string;
  publishedAt: string;
  slug: string;
  sortOrder: string;
  sourceUrl: string;
  summary: string;
  techNames: string;
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
    badgeLabel: "",
    category: ProjectCategory.Web,
    coverAssetId: "",
    detail: "",
    externalUrl: "",
    isFeatured: true,
    metricLabel: "",
    metricValue: "",
    name: "",
    publishedAt: "",
    slug: "",
    sortOrder: "0",
    sourceUrl: "",
    summary: "",
    techNames: "",
  };
}

function createFormStateFromProject(project: ProjectDto): FormState {
  return {
    badgeLabel: project.badgeLabel ?? "",
    category: project.category,
    coverAssetId: project.coverAssetId ?? "",
    detail: project.detail ?? "",
    externalUrl: project.externalUrl ?? "",
    isFeatured: project.isFeatured,
    metricLabel: project.metricLabel ?? "",
    metricValue: project.metricValue ?? "",
    name: project.name,
    publishedAt: toDateTimeLocalValue(project.publishedAt),
    slug: project.slug,
    sortOrder: String(project.sortOrder),
    sourceUrl: project.sourceUrl ?? "",
    summary: project.summary,
    techNames: project.techNames.join(", "),
  };
}

function formatCategoryLabel(category: ProjectCategory) {
  if (category === ProjectCategory.OpenSource) {
    return "Open Source";
  }

  return category;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}
