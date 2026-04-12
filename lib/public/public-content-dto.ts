import { ArticleStatus, FriendLinkStatus, ProjectCategory } from "@/generated/prisma/enums";
import type { ChangelogItemType } from "@/generated/prisma/enums";
import { z } from "zod";

type PublicArticleCategoryRecord = {
  color: string | null;
  id: string;
  name: string;
  slug: string;
};

type PublicArticleTagRecord = {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
};

type PublicAssetRecord = {
  altText: string | null;
  originalUrl: string | null;
};

type PublicArticleListRecord = {
  articleTags: PublicArticleTagRecord[];
  category: PublicArticleCategoryRecord | null;
  commentCount: number;
  coverAsset: PublicAssetRecord | null;
  excerpt: string | null;
  id: string;
  isFeatured: boolean;
  likeCount: number;
  publishedAt: Date | null;
  readingTimeMinutes: number | null;
  slug: string;
  title: string;
  viewCount: number;
};

type PublicArticleDetailRecord = PublicArticleListRecord & {
  categoryId: string | null;
  contentHtml: string | null;
  contentMarkdown: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
};

type PublicProjectTechnologyRecord = {
  techName: string;
};

type PublicProjectRecord = {
  badgeLabel: string | null;
  category: (typeof ProjectCategory)[keyof typeof ProjectCategory];
  coverAsset: PublicAssetRecord | null;
  detail: string | null;
  externalUrl: string | null;
  id: string;
  isFeatured: boolean;
  metricLabel: string | null;
  metricValue: string | null;
  name: string;
  publishedAt: Date | null;
  slug: string;
  sourceUrl: string | null;
  summary: string;
  technologies: PublicProjectTechnologyRecord[];
};

type PublicFriendLinkRecord = {
  avatarAsset: PublicAssetRecord | null;
  description: string;
  domain: string | null;
  id: string;
  siteName: string;
  siteUrl: string;
  subtitle: string | null;
};

type PublicChangelogItemRecord = {
  description: string | null;
  id: string;
  itemType: ChangelogItemType;
  title: string;
};

type PublicChangelogReleaseRecord = {
  id: string;
  isMajor: boolean;
  items: PublicChangelogItemRecord[];
  releasedOn: Date;
  summary: string | null;
  title: string;
  version: string;
};

type PublicSettingsRecord = {
  accentColor: string | null;
  blogDescription: string | null;
  blogName: string;
  blogUrl: string;
  contactEmail: string | null;
  defaultMetaDescription: string | null;
  defaultMetaTitle: string | null;
  languageCode: string;
  logoAsset: PublicAssetRecord | null;
  theme: string;
  timezone: string;
};

type PublicArticleCategorySummaryRecord = PublicArticleCategoryRecord & {
  usageCount: number;
};

type PublicSiteStatsRecord = {
  articleCount: number;
  featuredProjectCount: number;
  openSourceProjectCount: number;
  projectCategoryCount: number;
  projectCount: number;
  subscriberCount: number;
};

const normalizedSlugSchema = z.string().trim().min(1, "Slug is required.").max(255, "Slug is too long.");

const normalizedKeywordSchema = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

const normalizedBooleanFilterSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean().optional());

const pageSchema = z.coerce.number({ error: "Page must be a number." }).int().min(1).default(1);
const pageSizeSchema = z.coerce.number({ error: "Page size must be a number." }).int().min(1).max(50).default(10);

const publicProjectCategorySchema = z.enum([
  ProjectCategory.Design,
  ProjectCategory.Mobile,
  ProjectCategory.OpenSource,
  ProjectCategory.Web,
]);

const optionalTextSchema = z.preprocess((value) => {
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

export const publicArticleSlugSchema = normalizedSlugSchema;

export const publicListArticlesQuerySchema = z.object({
  categorySlug: normalizedSlugSchema.optional(),
  featured: normalizedBooleanFilterSchema,
  keyword: normalizedKeywordSchema,
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const publicListProjectsQuerySchema = z.object({
  category: publicProjectCategorySchema.optional(),
  featured: normalizedBooleanFilterSchema,
  keyword: normalizedKeywordSchema,
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const publicListFriendLinksQuerySchema = z.object({
  keyword: normalizedKeywordSchema,
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const publicListChangelogQuerySchema = z.object({
  isMajor: normalizedBooleanFilterSchema,
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const createFriendLinkApplicationBodySchema = z.object({
  avatarUrl: optionalTextSchema.pipe(z.url("Avatar URL must be valid.").nullable().optional()),
  siteDescription: z.string().trim().min(1, "Site description is required.").max(5000, "Site description is too long."),
  siteName: z.string().trim().min(1, "Site name is required.").max(120, "Site name must not exceed 120 characters."),
  siteUrl: z.string().trim().min(1, "Site URL is required.").max(255, "Site URL must not exceed 255 characters.").refine(URL.canParse, "Site URL must be valid."),
});

export type PublicArticleCategoryDto = {
  color: string | null;
  id: string;
  name: string;
  slug: string;
};

export type PublicArticleCategorySummaryDto = PublicArticleCategoryDto & {
  usageCount: number;
};

export type PublicArticleTagDto = {
  id: string;
  name: string;
  slug: string;
};

export type PublicArticleListItemDto = {
  category: PublicArticleCategoryDto | null;
  commentCount: number;
  coverImageAlt: string | null;
  coverImageUrl: string | null;
  excerpt: string | null;
  id: string;
  isFeatured: boolean;
  likeCount: number;
  publishedAt: string;
  readTimeLabel: string;
  readingTimeMinutes: number | null;
  slug: string;
  tags: PublicArticleTagDto[];
  title: string;
  viewCount: number;
};

export type PublicArticleDto = PublicArticleListItemDto & {
  contentHtml: string | null;
  contentMarkdown: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
};

export type PublicArticleDetailDto = {
  article: PublicArticleDto;
  relatedArticles: PublicArticleListItemDto[];
};

export type PublicProjectDto = {
  badgeLabel: string | null;
  category: (typeof ProjectCategory)[keyof typeof ProjectCategory];
  categorySlug: "design" | "mobile" | "open-source" | "web";
  coverImageAlt: string | null;
  coverImageUrl: string | null;
  description: string;
  detail: string | null;
  externalUrl: string | null;
  href: string;
  id: string;
  isFeatured: boolean;
  label: string;
  metric: string | null;
  name: string;
  publishedAt: string;
  slug: string;
  sourceUrl: string | null;
  summary: string;
  techNames: string[];
  title: string;
};

export type PublicFriendLinkDto = {
  avatarAlt: string | null;
  avatarUrl: string | null;
  description: string;
  domain: string;
  id: string;
  role: string | null;
  siteName: string;
  siteUrl: string;
};

export type PublicChangelogItemDto = {
  description: string | null;
  id: string;
  itemType: ChangelogItemType;
  title: string;
};

export type PublicChangelogReleaseDto = {
  date: string;
  id: string;
  isMajor: boolean;
  items: PublicChangelogItemDto[];
  releasedOn: string;
  summary: string | null;
  title: string;
  version: string;
};

export type PublicSiteStatDto = {
  label: string;
  value: string;
};

export type PublicSiteDto = {
  articleCategories: PublicArticleCategorySummaryDto[];
  projectStats: PublicSiteStatDto[];
  settings: {
    accentColor: string | null;
    blogDescription: string | null;
    blogName: string;
    blogUrl: string;
    contactEmail: string | null;
    defaultMetaDescription: string | null;
    defaultMetaTitle: string | null;
    languageCode: string;
    logoAlt: string | null;
    logoUrl: string | null;
    theme: string;
    timezone: string;
  };
  stats: PublicSiteStatDto[];
};

export type CreateFriendLinkApplicationInput = z.infer<typeof createFriendLinkApplicationBodySchema>;
export type PublicListArticlesQuery = z.infer<typeof publicListArticlesQuerySchema>;
export type PublicListChangelogQuery = z.infer<typeof publicListChangelogQuerySchema>;
export type PublicListFriendLinksQuery = z.infer<typeof publicListFriendLinksQuerySchema>;
export type PublicListProjectsQuery = z.infer<typeof publicListProjectsQuerySchema>;

export type PublicListResult<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const publicContentVisibility = {
  articleStatus: ArticleStatus.Published,
  friendLinkStatus: FriendLinkStatus.Approved,
} as const;

export function toPublicArticleDto(article: PublicArticleDetailRecord): PublicArticleDto {
  return {
    ...toPublicArticleListItemDto(article),
    contentHtml: article.contentHtml,
    contentMarkdown: article.contentMarkdown,
    seoDescription: article.seoDescription,
    seoTitle: article.seoTitle,
  };
}

export function toPublicArticleListItemDto(article: PublicArticleListRecord): PublicArticleListItemDto {
  return {
    category: article.category,
    commentCount: article.commentCount,
    coverImageAlt: article.coverAsset?.altText ?? null,
    coverImageUrl: article.coverAsset?.originalUrl ?? null,
    excerpt: article.excerpt,
    id: article.id,
    isFeatured: article.isFeatured,
    likeCount: article.likeCount,
    publishedAt: getRequiredIsoDate(article.publishedAt),
    readTimeLabel: formatReadTimeLabel(article.readingTimeMinutes),
    readingTimeMinutes: article.readingTimeMinutes,
    slug: article.slug,
    tags: article.articleTags.map(({ tag }) => tag),
    title: article.title,
    viewCount: article.viewCount,
  };
}

export function toPublicProjectDto(project: PublicProjectRecord): PublicProjectDto {
  const metric = project.metricValue && project.metricLabel ? `${project.metricValue} ${project.metricLabel}` : project.metricValue ?? project.metricLabel;

  return {
    badgeLabel: project.badgeLabel,
    category: project.category,
    categorySlug: getProjectCategorySlug(project.category),
    coverImageAlt: project.coverAsset?.altText ?? null,
    coverImageUrl: project.coverAsset?.originalUrl ?? null,
    description: project.summary,
    detail: project.detail,
    externalUrl: project.externalUrl,
    href: project.externalUrl ?? project.sourceUrl ?? `/projects#${project.slug}`,
    id: project.id,
    isFeatured: project.isFeatured,
    label: project.badgeLabel ?? getProjectCategoryLabel(project.category),
    metric,
    name: project.name,
    publishedAt: getRequiredIsoDate(project.publishedAt),
    slug: project.slug,
    sourceUrl: project.sourceUrl,
    summary: project.summary,
    techNames: project.technologies.map((technology) => technology.techName),
    title: project.name,
  };
}

export function toPublicFriendLinkDto(friendLink: PublicFriendLinkRecord): PublicFriendLinkDto {
  return {
    avatarAlt: friendLink.avatarAsset?.altText ?? null,
    avatarUrl: friendLink.avatarAsset?.originalUrl ?? null,
    description: friendLink.description,
    domain: friendLink.domain ?? getDomain(friendLink.siteUrl),
    id: friendLink.id,
    role: friendLink.subtitle,
    siteName: friendLink.siteName,
    siteUrl: friendLink.siteUrl,
  };
}

export function toPublicChangelogReleaseDto(release: PublicChangelogReleaseRecord): PublicChangelogReleaseDto {
  return {
    date: formatDateKey(release.releasedOn),
    id: release.id,
    isMajor: release.isMajor,
    items: release.items.map((item) => ({
      description: item.description,
      id: item.id,
      itemType: item.itemType,
      title: item.title,
    })),
    releasedOn: release.releasedOn.toISOString(),
    summary: release.summary,
    title: release.title,
    version: release.version,
  };
}

export function toPublicSiteDto({
  articleCategories,
  settings,
  stats,
}: {
  articleCategories: PublicArticleCategorySummaryRecord[];
  settings: PublicSettingsRecord;
  stats: PublicSiteStatsRecord;
}): PublicSiteDto {
  return {
    articleCategories: articleCategories.map((category) => ({
      color: category.color,
      id: category.id,
      name: category.name,
      slug: category.slug,
      usageCount: category.usageCount,
    })),
    projectStats: [
      { label: "Projects", value: formatCompactNumber(stats.projectCount) },
      { label: "Featured", value: formatCompactNumber(stats.featuredProjectCount) },
      { label: "Open Source", value: formatCompactNumber(stats.openSourceProjectCount) },
      { label: "Categories", value: formatCompactNumber(stats.projectCategoryCount) },
    ],
    settings: {
      accentColor: settings.accentColor,
      blogDescription: settings.blogDescription,
      blogName: settings.blogName,
      blogUrl: settings.blogUrl,
      contactEmail: settings.contactEmail,
      defaultMetaDescription: settings.defaultMetaDescription,
      defaultMetaTitle: settings.defaultMetaTitle,
      languageCode: settings.languageCode,
      logoAlt: settings.logoAsset?.altText ?? null,
      logoUrl: settings.logoAsset?.originalUrl ?? null,
      theme: settings.theme,
      timezone: settings.timezone,
    },
    stats: [
      { label: "Articles", value: formatCompactNumber(stats.articleCount) },
      { label: "Projects", value: formatCompactNumber(stats.projectCount) },
      { label: "Subscribers", value: formatCompactNumber(stats.subscriberCount) },
    ],
  };
}

function formatReadTimeLabel(minutes: number | null) {
  if (!minutes || minutes <= 0) {
    return "1 min read";
  }

  return `${minutes} min read`;
}

function getRequiredIsoDate(date: Date | null) {
  return (date ?? new Date(0)).toISOString();
}

function getProjectCategoryLabel(category: (typeof ProjectCategory)[keyof typeof ProjectCategory]) {
  const labels: Record<(typeof ProjectCategory)[keyof typeof ProjectCategory], string> = {
    [ProjectCategory.Design]: "Design",
    [ProjectCategory.Mobile]: "Mobile",
    [ProjectCategory.OpenSource]: "Open Source",
    [ProjectCategory.Web]: "Web",
  };

  return labels[category];
}

function getProjectCategorySlug(category: (typeof ProjectCategory)[keyof typeof ProjectCategory]) {
  const slugs: Record<(typeof ProjectCategory)[keyof typeof ProjectCategory], PublicProjectDto["categorySlug"]> = {
    [ProjectCategory.Design]: "design",
    [ProjectCategory.Mobile]: "mobile",
    [ProjectCategory.OpenSource]: "open-source",
    [ProjectCategory.Web]: "web",
  };

  return slugs[category];
}

function getDomain(siteUrl: string) {
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl;
  }
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
