import { ArticleStatus } from "@/generated/prisma/enums";
import { z } from "zod";

type ArticleCategoryRecord = {
  color: string | null;
  id: string;
  name: string;
  slug: string;
};

type ArticleTagRecord = {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
};

type ArticleListRecord = {
  archivedAt: Date | null;
  articleTags: ArticleTagRecord[];
  category: ArticleCategoryRecord | null;
  commentCount: number;
  createdAt: Date;
  excerpt: string | null;
  id: string;
  isFeatured: boolean;
  likeCount: number;
  publishedAt: Date | null;
  readingTimeMinutes: number | null;
  slug: string;
  status: (typeof ArticleStatus)[keyof typeof ArticleStatus];
  title: string;
  updatedAt: Date;
  viewCount: number;
};

type ArticleDetailRecord = ArticleListRecord & {
  categoryId: string | null;
  contentHtml: string | null;
  contentMarkdown: string | null;
  coverAssetId: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
};

const articleStatusSchema = z.enum([ArticleStatus.Archived, ArticleStatus.Draft, ArticleStatus.Published]);

const normalizedStringIdSchema = z
  .string({
    error: "Article id must be a string.",
  })
  .trim()
  .min(1, "Article id is required.")
  .max(191, "Article id is too long.");

const normalizedRelationIdSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().max(191, "Relation id is too long.").nullable().optional());

const normalizedTextSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().nullable().optional());

const normalizedTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required.")
  .max(255, "Title must not exceed 255 characters.");

const normalizedSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(255, "Slug must not exceed 255 characters.");

const normalizedSeoDescriptionSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return value;
}, z.string().max(500, "SEO description must not exceed 500 characters.").nullable().optional());

const normalizedReadingTimeSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  return value;
}, z.coerce.number({ error: "Reading time must be a number." }).int("Reading time must be an integer.").min(0, "Reading time must be at least 0.").nullable().optional());

const normalizedDateSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return value;
}, z.date().nullable().optional());

const normalizedTagIdsSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  return value;
}, z.array(normalizedStringIdSchema).max(100, "Tag ids must not exceed 100 items.").transform((value) => Array.from(new Set(value))).optional());

export const articleIdSchema = normalizedStringIdSchema;

export const listArticlesQuerySchema = z.object({
  categoryId: normalizedRelationIdSchema,
  keyword: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  page: z.coerce
    .number({
      error: "Page must be a number.",
    })
    .int("Page must be an integer.")
    .min(1, "Page must be at least 1.")
    .default(1),
  pageSize: z.coerce
    .number({
      error: "Page size must be a number.",
    })
    .int("Page size must be an integer.")
    .min(1, "Page size must be at least 1.")
    .max(50, "Page size must not exceed 50.")
    .default(10),
  status: articleStatusSchema.optional(),
});

export const createArticleBodySchema = z.object({
  archivedAt: normalizedDateSchema,
  categoryId: normalizedRelationIdSchema,
  contentHtml: normalizedTextSchema,
  contentMarkdown: normalizedTextSchema,
  coverAssetId: normalizedRelationIdSchema,
  excerpt: normalizedTextSchema,
  isFeatured: z.boolean().default(false),
  publishedAt: normalizedDateSchema,
  readingTimeMinutes: normalizedReadingTimeSchema,
  seoDescription: normalizedSeoDescriptionSchema,
  seoTitle: normalizedTextSchema,
  slug: normalizedSlugSchema,
  status: articleStatusSchema.default(ArticleStatus.Draft),
  tagIds: normalizedTagIdsSchema,
  title: normalizedTitleSchema,
});

export const updateArticleBodySchema = z
  .object({
    archivedAt: normalizedDateSchema,
    categoryId: normalizedRelationIdSchema,
    contentHtml: normalizedTextSchema,
    contentMarkdown: normalizedTextSchema,
    coverAssetId: normalizedRelationIdSchema,
    excerpt: normalizedTextSchema,
    isFeatured: z.boolean().optional(),
    publishedAt: normalizedDateSchema,
    readingTimeMinutes: normalizedReadingTimeSchema,
    seoDescription: normalizedSeoDescriptionSchema,
    seoTitle: normalizedTextSchema,
    slug: normalizedSlugSchema.optional(),
    status: articleStatusSchema.optional(),
    tagIds: normalizedTagIdsSchema,
    title: normalizedTitleSchema.optional(),
  })
  .refine(
    (value) =>
      value.archivedAt !== undefined ||
      value.categoryId !== undefined ||
      value.contentHtml !== undefined ||
      value.contentMarkdown !== undefined ||
      value.coverAssetId !== undefined ||
      value.excerpt !== undefined ||
      value.isFeatured !== undefined ||
      value.publishedAt !== undefined ||
      value.readingTimeMinutes !== undefined ||
      value.seoDescription !== undefined ||
      value.seoTitle !== undefined ||
      value.slug !== undefined ||
      value.status !== undefined ||
      value.tagIds !== undefined ||
      value.title !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type ArticleCategoryDto = {
  color: string | null;
  id: string;
  name: string;
  slug: string;
};

export type ArticleTagDto = {
  id: string;
  name: string;
  slug: string;
};

export type ArticleListItemDto = {
  archivedAt: string | null;
  category: ArticleCategoryDto | null;
  commentCount: number;
  createdAt: string;
  excerpt: string | null;
  id: string;
  isFeatured: boolean;
  likeCount: number;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  slug: string;
  status: (typeof ArticleStatus)[keyof typeof ArticleStatus];
  tags: ArticleTagDto[];
  title: string;
  updatedAt: string;
  viewCount: number;
};

export type ArticleDto = ArticleListItemDto & {
  categoryId: string | null;
  contentHtml: string | null;
  contentMarkdown: string | null;
  coverAssetId: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  tagIds: string[];
};

export type CreateArticleInput = z.infer<typeof createArticleBodySchema>;
export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleBodySchema>;

export function toArticleDto(article: ArticleDetailRecord): ArticleDto {
  return {
    ...toArticleListItemDto(article),
    categoryId: article.categoryId,
    contentHtml: article.contentHtml,
    contentMarkdown: article.contentMarkdown,
    coverAssetId: article.coverAssetId,
    seoDescription: article.seoDescription,
    seoTitle: article.seoTitle,
    tagIds: article.articleTags.map(({ tag }) => tag.id),
  };
}

export function toArticleListItemDto(article: ArticleListRecord): ArticleListItemDto {
  return {
    archivedAt: article.archivedAt?.toISOString() ?? null,
    category: article.category
      ? {
          color: article.category.color,
          id: article.category.id,
          name: article.category.name,
          slug: article.category.slug,
        }
      : null,
    commentCount: article.commentCount,
    createdAt: article.createdAt.toISOString(),
    excerpt: article.excerpt,
    id: article.id,
    isFeatured: article.isFeatured,
    likeCount: article.likeCount,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    readingTimeMinutes: article.readingTimeMinutes,
    slug: article.slug,
    status: article.status,
    tags: article.articleTags.map(({ tag }) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    title: article.title,
    updatedAt: article.updatedAt.toISOString(),
    viewCount: article.viewCount,
  };
}
