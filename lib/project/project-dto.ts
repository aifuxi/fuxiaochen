import { ProjectCategory } from "@/generated/prisma/enums";
import { z } from "zod";

type ProjectTechnologyRecord = {
  techName: string;
};

type ProjectCoverAssetRecord = {
  altText: string | null;
  id: string;
  originalUrl: string | null;
};

type ProjectRecord = {
  badgeLabel: string | null;
  category: (typeof ProjectCategory)[keyof typeof ProjectCategory];
  coverAsset: ProjectCoverAssetRecord | null;
  coverAssetId: string | null;
  createdAt: Date;
  detail: string | null;
  externalUrl: string | null;
  id: string;
  isFeatured: boolean;
  metricLabel: string | null;
  metricValue: string | null;
  name: string;
  technologies: ProjectTechnologyRecord[];
  publishedAt: Date | null;
  slug: string;
  sortOrder: number;
  sourceUrl: string | null;
  summary: string;
  updatedAt: Date;
};

const projectCategorySchema = z.enum([
  ProjectCategory.Design,
  ProjectCategory.Mobile,
  ProjectCategory.OpenSource,
  ProjectCategory.Web,
]);

const normalizedStringIdSchema = z
  .string({
    error: "Project id must be a string.",
  })
  .trim()
  .min(1, "Project id is required.")
  .max(191, "Project id is too long.");

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

const normalizedUrlSchema = z.preprocess((value) => {
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
}, z.url("URL must be valid.").nullable().optional());

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

const normalizedSortOrderSchema = z.coerce
  .number({
    error: "Sort order must be a number.",
  })
  .int("Sort order must be an integer.")
  .min(0, "Sort order must be at least 0.");

const normalizedNameSchema = z.string().trim().min(1, "Name is required.").max(150, "Name must not exceed 150 characters.");
const normalizedSlugSchema = z.string().trim().min(1, "Slug is required.").max(150, "Slug must not exceed 150 characters.");
const normalizedSummarySchema = z.string().trim().min(1, "Summary is required.").max(5000, "Summary is too long.");

const normalizedTechNamesSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  return value;
}, z.array(z.string().trim().min(1, "Technology name is required.").max(60, "Technology name must not exceed 60 characters.")).max(50, "Technologies must not exceed 50 items.").transform((value) => Array.from(new Set(value))).optional());

const normalizedBooleanFilterSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

export const projectIdSchema = normalizedStringIdSchema;

export const listProjectsQuerySchema = z.object({
  category: projectCategorySchema.optional(),
  isFeatured: normalizedBooleanFilterSchema,
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
});

export const createProjectBodySchema = z.object({
  badgeLabel: normalizedTextSchema.pipe(z.string().max(60, "Badge label must not exceed 60 characters.").nullable().optional()),
  category: projectCategorySchema,
  coverAssetId: normalizedRelationIdSchema,
  detail: normalizedTextSchema,
  externalUrl: normalizedUrlSchema,
  isFeatured: z.boolean().default(true),
  metricLabel: normalizedTextSchema.pipe(z.string().max(40, "Metric label must not exceed 40 characters.").nullable().optional()),
  metricValue: normalizedTextSchema.pipe(z.string().max(40, "Metric value must not exceed 40 characters.").nullable().optional()),
  name: normalizedNameSchema,
  publishedAt: normalizedDateSchema,
  slug: normalizedSlugSchema,
  sortOrder: normalizedSortOrderSchema.default(0),
  sourceUrl: normalizedUrlSchema,
  summary: normalizedSummarySchema,
  techNames: normalizedTechNamesSchema,
});

export const updateProjectBodySchema = z
  .object({
    badgeLabel: normalizedTextSchema.pipe(z.string().max(60, "Badge label must not exceed 60 characters.").nullable().optional()),
    category: projectCategorySchema.optional(),
    coverAssetId: normalizedRelationIdSchema,
    detail: normalizedTextSchema,
    externalUrl: normalizedUrlSchema,
    isFeatured: z.boolean().optional(),
    metricLabel: normalizedTextSchema.pipe(z.string().max(40, "Metric label must not exceed 40 characters.").nullable().optional()),
    metricValue: normalizedTextSchema.pipe(z.string().max(40, "Metric value must not exceed 40 characters.").nullable().optional()),
    name: normalizedNameSchema.optional(),
    publishedAt: normalizedDateSchema,
    slug: normalizedSlugSchema.optional(),
    sortOrder: normalizedSortOrderSchema.optional(),
    sourceUrl: normalizedUrlSchema,
    summary: normalizedSummarySchema.optional(),
    techNames: normalizedTechNamesSchema,
  })
  .refine(
    (value) =>
      value.badgeLabel !== undefined ||
      value.category !== undefined ||
      value.coverAssetId !== undefined ||
      value.detail !== undefined ||
      value.externalUrl !== undefined ||
      value.isFeatured !== undefined ||
      value.metricLabel !== undefined ||
      value.metricValue !== undefined ||
      value.name !== undefined ||
      value.publishedAt !== undefined ||
      value.slug !== undefined ||
      value.sortOrder !== undefined ||
      value.sourceUrl !== undefined ||
      value.summary !== undefined ||
      value.techNames !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type ProjectCoverAssetDto = {
  altText: string | null;
  id: string;
  originalUrl: string | null;
};

export type ProjectDto = {
  badgeLabel: string | null;
  category: (typeof ProjectCategory)[keyof typeof ProjectCategory];
  coverAsset: ProjectCoverAssetDto | null;
  coverAssetId: string | null;
  createdAt: string;
  detail: string | null;
  externalUrl: string | null;
  id: string;
  isFeatured: boolean;
  metricLabel: string | null;
  metricValue: string | null;
  name: string;
  publishedAt: string | null;
  slug: string;
  sortOrder: number;
  sourceUrl: string | null;
  summary: string;
  techNames: string[];
  updatedAt: string;
};

export type CreateProjectInput = z.infer<typeof createProjectBodySchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectBodySchema>;

export function toProjectDto(project: ProjectRecord): ProjectDto {
  return {
    badgeLabel: project.badgeLabel,
    category: project.category,
    coverAsset: project.coverAsset
      ? {
          altText: project.coverAsset.altText,
          id: project.coverAsset.id,
          originalUrl: project.coverAsset.originalUrl,
        }
      : null,
    coverAssetId: project.coverAssetId,
    createdAt: project.createdAt.toISOString(),
    detail: project.detail,
    externalUrl: project.externalUrl,
    id: project.id,
    isFeatured: project.isFeatured,
    metricLabel: project.metricLabel,
    metricValue: project.metricValue,
    name: project.name,
    publishedAt: project.publishedAt?.toISOString() ?? null,
    slug: project.slug,
    sortOrder: project.sortOrder,
    sourceUrl: project.sourceUrl,
    summary: project.summary,
    techNames: project.technologies.map((technology) => technology.techName),
    updatedAt: project.updatedAt.toISOString(),
  };
}
