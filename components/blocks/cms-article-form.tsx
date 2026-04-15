"use client";

import { ArticleStatus } from "@/generated/prisma/enums";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { CmsEditorLayout } from "@/components/cms/cms-editor-layout";
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";
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
  { label: "草稿", value: ArticleStatus.Draft },
  { label: "已发布", value: ArticleStatus.Published },
  { label: "已归档", value: ArticleStatus.Archived },
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
      toast.error(parsedValues.error.issues[0]?.message ?? "请检查您的输入。");

      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && articleId) {
        await updateArticle(articleId, parsedValues.data as UpdateArticleInput);
        toast.success("文章更新成功。");
        router.refresh();
      } else {
        const article = await createArticle(parsedValues.data as CreateArticleInput);
        toast.success("文章创建成功。");
        router.replace(`/cms/article/${article.id}`);
      }
    } catch (error) {
      if (error instanceof ArticleApiError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("保存文章失败。");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <CmsEditorLayout
        primary={
          <>
            <div className={`
              h-56 animate-pulse rounded-2xl border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-2)]
            `} />
            <div className={`
              h-[720px] animate-pulse rounded-2xl border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-2)]
            `} />
          </>
        }
        sidebar={<div className={`
          h-[720px] animate-pulse rounded-2xl border
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-2)]
        `} />}
      />
    );
  }

  return (
    <CmsEditorLayout
      primary={
        <>
          <CmsSectionPanel title="标题与元数据">
            <div className="space-y-5">
              <Field label="标题">
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
                  placeholder="构建一个简洁的 CMS"
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
                <Field description="可选的阅读时长（分钟）。" label="阅读时长">
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

              <Field description="用于归档卡片和预览。" label="摘要">
                <Textarea
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      excerpt: event.target.value,
                    }))
                  }
                  placeholder="关于界面节奏和 CMS 人体工程学的简洁编辑笔记。"
                  value={values.excerpt}
                />
              </Field>
            </div>
          </CmsSectionPanel>

          <CmsSectionPanel title="内容编辑">
            <Tabs defaultValue="editor">
              <TabsList>
                <TabsTrigger value="editor">编辑器</TabsTrigger>
                <TabsTrigger value="preview">预览</TabsTrigger>
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
                <div className={`
                  rounded-[1.8rem] border
                  border-[color:var(--color-line-default)]
                  bg-[color:var(--color-surface-1)]
                  p-6
                `}>
                  <div className="prose max-w-none prose-invert">
                    <MarkdownViewer value={values.contentMarkdown} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CmsSectionPanel>
        </>
      }
      sidebar={
        <>
          <CmsSectionPanel>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Check className="size-4" />
                {isEditMode ? "正在编辑文章" : "准备发布"}
              </div>
              <Button
                className="w-full justify-center"
                disabled={isSubmitting}
                onClick={() => void handleSubmit(ArticleStatus.Published)}
                type="button"
              >
                {isSubmitting ? "保存中..." : "发布文章"}
              </Button>
              <Button
                className="w-full justify-center"
                disabled={isSubmitting}
                onClick={() => void handleSubmit(ArticleStatus.Draft)}
                type="button"
                variant="outline"
              >
                保存草稿
              </Button>
            </div>
          </CmsSectionPanel>

          <CmsSectionPanel title="文章设置">
            <div className="space-y-5">
              <Field label="状态">
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

              <Field label="分类">
                <Select
                  onValueChange={(value) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      categoryId: value as string,
                    }))
                  }
                  options={[
                    { label: "未分类", value: "" },
                    ...categories.map((category) => ({
                      label: category.name,
                      value: category.id,
                    })),
                  ]}
                  value={values.categoryId}
                />
              </Field>

              <Field label="标签">
                <div className={`
                  space-y-2 rounded-2xl border
                  border-[color:var(--color-line-default)]
                  bg-[color:var(--color-surface-1)]
                  p-4
                `}>
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
                    <p className="text-sm text-muted">暂无标签。</p>
                  )}
                </div>
              </Field>

              <label className={`
                flex items-center gap-3 rounded-2xl border
                border-[color:var(--color-line-default)]
                bg-[color:var(--color-surface-1)]
                p-4 text-sm text-foreground
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
                <span>将此文章设为精选</span>
              </label>

              <div className={`
                grid gap-5
                sm:grid-cols-2
                xl:grid-cols-1
              `}>
                <Field label="发布时间">
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
                <Field label="归档时间">
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
            </div>
          </CmsSectionPanel>

          <CmsSectionPanel title="SEO">
            <div className="space-y-5">
              <Field label="SEO 标题">
                <Input
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      seoTitle: event.target.value,
                    }))
                  }
                  placeholder="优化的搜索标题"
                  value={values.seoTitle}
                />
              </Field>
              <Field label="SEO 描述">
                <Textarea
                  onChange={(event) =>
                    setValues((currentValues) => ({
                      ...currentValues,
                      seoDescription: event.target.value,
                    }))
                  }
                  placeholder="简洁的搜索摘要"
                  value={values.seoDescription}
                />
              </Field>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{values.tagIds.length} 个标签</Badge>
                  <Badge variant="muted">{values.status}</Badge>
                </div>
              </div>
            </div>
          </CmsSectionPanel>
        </>
      }
    />
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
