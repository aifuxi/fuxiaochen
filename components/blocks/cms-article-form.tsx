"use client";

import { ArticleStatus } from "@/generated/prisma/enums";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { MarkdownViewer } from "@/components/editor/markdown-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArticleApiError,
  createArticle,
  getArticle,
  updateArticle,
} from "@/lib/article/article-client";
import type { ArticleDto, CreateArticleInput, UpdateArticleInput } from "@/lib/article/article-dto";
import { createArticleBodySchema, updateArticleBodySchema } from "@/lib/article/article-dto";
import { listCategories } from "@/lib/category/category-client";
import { listTags } from "@/lib/tag/tag-client";

type CmsArticleFormProps = {
  articleId?: string;
};

const STATUS_OPTIONS = [
  { label: "Draft", value: ArticleStatus.Draft },
  { label: "Published", value: ArticleStatus.Published },
  { label: "Archived", value: ArticleStatus.Archived },
];

export function CmsArticleForm({ articleId }: CmsArticleFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(articleId);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [values, setValues] = React.useState<FormState>(createEmptyFormState());
  const [hasEditedSlug, setHasEditedSlug] = React.useState(isEditMode);

  const { data: articleData, isLoading: isArticleLoading } = useSWR(
    articleId ? ["article-detail", articleId] : null,
    () => getArticle(articleId!),
  );
  const { data: categoriesData, isLoading: areCategoriesLoading } = useSWR(["article-form-categories"], () =>
    listCategories({
      page: 1,
      pageSize: 50,
    }),
  );
  const { data: tagsData, isLoading: areTagsLoading } = useSWR(["article-form-tags"], () =>
    listTags({
      page: 1,
      pageSize: 50,
    }),
  );

  React.useEffect(() => {
    if (!articleData) {
      return;
    }

    setValues(createFormStateFromArticle(articleData));
  }, [articleData]);

  const categories = categoriesData?.items ?? [];
  const tags = tagsData?.items ?? [];
  const isLoading = isArticleLoading || areCategoriesLoading || areTagsLoading;

  async function handleSubmit(nextStatus?: ArticleStatus) {
    const payload = {
      archivedAt: values.archivedAt || null,
      categoryId: values.categoryId || null,
      contentHtml: null,
      contentMarkdown: values.contentMarkdown || null,
      coverAssetId: values.coverAssetId || null,
      excerpt: values.excerpt || null,
      isFeatured: values.isFeatured,
      publishedAt: values.publishedAt || null,
      readingTimeMinutes: values.readingTimeMinutes || null,
      seoDescription: values.seoDescription || null,
      seoTitle: values.seoTitle || null,
      slug: values.slug,
      status: nextStatus ?? values.status,
      tagIds: values.tagIds,
      title: values.title,
    };

    const parsedValues = isEditMode
      ? updateArticleBodySchema.safeParse(payload)
      : createArticleBodySchema.safeParse(payload);

    if (!parsedValues.success) {
      toast.error(parsedValues.error.issues[0]?.message ?? "Please check your input.");

      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && articleId) {
        await updateArticle(articleId, parsedValues.data as UpdateArticleInput);
        toast.success("Article updated successfully.");
        router.refresh();
      } else {
        const article = await createArticle(parsedValues.data as CreateArticleInput);
        toast.success("Article created successfully.");
        router.replace(`/cms/article/${article.id}`);
      }
    } catch (error) {
      if (error instanceof ArticleApiError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save article.");
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
          <div className="border-b border-white/8 px-6 py-4 text-sm font-semibold">Title & Metadata</div>
          <div className="space-y-5 p-6">
            <Field label="Title">
              <Input
                onChange={(event) => {
                  const nextTitle = event.target.value;

                  setValues((currentValues) => {
                    if (!hasEditedSlug) {
                      return {
                        ...currentValues,
                        slug: slugify(nextTitle),
                        title: nextTitle,
                      };
                    }

                    return {
                      ...currentValues,
                      title: nextTitle,
                    };
                  });
                }}
                placeholder="Building a calm CMS"
                value={values.title}
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
                  placeholder="building-a-calm-cms"
                  value={values.slug}
                />
              </Field>
              <Field description="Optional read time in minutes." label="Reading Time">
                <Input
                  inputMode="numeric"
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      readingTimeMinutes: event.target.value,
                    }))
                  }
                  placeholder="6"
                  type="number"
                  value={values.readingTimeMinutes}
                />
              </Field>
            </div>

            <Field description="Used in archive cards and previews." label="Excerpt">
              <Textarea
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    excerpt: event.target.value,
                  }))
                }
                placeholder="A concise editorial note on interface pacing and CMS ergonomics."
                value={values.excerpt}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <MarkdownEditor
                onChange={(value) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    contentMarkdown: value,
                  }))
                }
                value={values.contentMarkdown}
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="rounded-[1.8rem] border border-white/8 bg-white/3 p-6">
                <div className="prose max-w-none prose-invert">
                  <MarkdownViewer value={values.contentMarkdown} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Check className="size-4" />
            {isEditMode ? "Editing existing article" : "Ready to publish"}
          </div>
          <div className="space-y-3">
            <Button
              className="w-full justify-center"
              disabled={isSubmitting}
              onClick={() => void handleSubmit(ArticleStatus.Published)}
              type="button"
            >
              {isSubmitting ? "Saving..." : "Publish Article"}
            </Button>
            <Button
              className="w-full justify-center"
              disabled={isSubmitting}
              onClick={() => void handleSubmit(ArticleStatus.Draft)}
              type="button"
              variant="outline"
            >
              Save Draft
            </Button>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="text-sm font-semibold">Post Settings</div>

          <Field label="Status">
            <Select
              onValueChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  status: value as ArticleStatus,
                }))
              }
              options={STATUS_OPTIONS}
              value={values.status}
            />
          </Field>

          <Field label="Category">
            <Select
              onValueChange={(value) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  categoryId: value as string,
                }))
              }
              options={[
                { label: "Uncategorized", value: "" },
                ...categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
              value={values.categoryId}
            />
          </Field>

          <Field label="Tags">
            <div className="space-y-2 rounded-2xl border border-white/8 bg-white/3 p-4">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-3 text-sm text-foreground">
                    <Checkbox
                      checked={values.tagIds.includes(tag.id)}
                      onCheckedChange={(checked) =>
                        setValues((currentValues) => ({
                          ...currentValues,
                          tagIds: checked
                            ? Array.from(new Set([...currentValues.tagIds, tag.id]))
                            : currentValues.tagIds.filter((item) => item !== tag.id),
                        }))
                      }
                    />
                    <span>{tag.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted">No tags available.</p>
              )}
            </div>
          </Field>

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
            <span>Feature this article</span>
          </label>

          <div className={`
            grid gap-5
            sm:grid-cols-2
            xl:grid-cols-1
          `}>
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
            <Field label="Archived At">
              <Input
                onChange={(event) =>
                  setValues((currentValues) => ({
                    ...currentValues,
                    archivedAt: event.target.value,
                  }))
                }
                type="datetime-local"
                value={values.archivedAt}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-white/8 bg-white/3 p-6">
          <div className="text-sm font-semibold">SEO</div>
          <Field label="SEO Title">
            <Input
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  seoTitle: event.target.value,
                }))
              }
              placeholder="Optimized headline for search"
              value={values.seoTitle}
            />
          </Field>
          <Field label="SEO Description">
            <Textarea
              onChange={(event) =>
                setValues((currentValues) => ({
                  ...currentValues,
                  seoDescription: event.target.value,
                }))
              }
              placeholder="Concise search summary"
              value={values.seoDescription}
            />
          </Field>
          <div className="space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Badge variant="muted">{values.tagIds.length} tags</Badge>
              <Badge variant="muted">{values.status}</Badge>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

type FormState = {
  archivedAt: string;
  categoryId: string;
  contentMarkdown: string;
  coverAssetId: string;
  excerpt: string;
  isFeatured: boolean;
  publishedAt: string;
  readingTimeMinutes: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: ArticleStatus;
  tagIds: string[];
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
    archivedAt: "",
    categoryId: "",
    contentMarkdown: "",
    coverAssetId: "",
    excerpt: "",
    isFeatured: false,
    publishedAt: "",
    readingTimeMinutes: "",
    seoDescription: "",
    seoTitle: "",
    slug: "",
    status: ArticleStatus.Draft,
    tagIds: [],
    title: "",
  };
}

function createFormStateFromArticle(article: ArticleDto): FormState {
  return {
    archivedAt: toDateTimeLocalValue(article.archivedAt),
    categoryId: article.categoryId ?? "",
    contentMarkdown: article.contentMarkdown ?? "",
    coverAssetId: article.coverAssetId ?? "",
    excerpt: article.excerpt ?? "",
    isFeatured: article.isFeatured,
    publishedAt: toDateTimeLocalValue(article.publishedAt),
    readingTimeMinutes: article.readingTimeMinutes?.toString() ?? "",
    seoDescription: article.seoDescription ?? "",
    seoTitle: article.seoTitle ?? "",
    slug: article.slug,
    status: article.status,
    tagIds: article.tagIds,
    title: article.title,
  };
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
