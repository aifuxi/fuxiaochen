import { z } from "zod";

type TagRecord = {
  _count: {
    articleTags: number;
  };
  createdAt: Date;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  updatedAt: Date;
};

const normalizedDescriptionSchema = z.preprocess((value) => {
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

const normalizedSortOrderSchema = z.coerce
  .number({
    error: "Sort order must be a number.",
  })
  .int("Sort order must be an integer.")
  .min(0, "Sort order must be at least 0.");

const normalizedStringIdSchema = z
  .string({
    error: "Tag id must be a string.",
  })
  .trim()
  .min(1, "Tag id is required.")
  .max(191, "Tag id is too long.");

export const tagIdSchema = normalizedStringIdSchema;

export const listTagsQuerySchema = z.object({
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

export const createTagBodySchema = z.object({
  description: normalizedDescriptionSchema,
  name: z.string().trim().min(1, "Name is required.").max(80, "Name must not exceed 80 characters."),
  slug: z.string().trim().min(1, "Slug is required.").max(80, "Slug must not exceed 80 characters."),
  sortOrder: normalizedSortOrderSchema.default(0),
});

export const updateTagBodySchema = z
  .object({
    description: normalizedDescriptionSchema,
    name: z.string().trim().min(1, "Name is required.").max(80, "Name must not exceed 80 characters.").optional(),
    slug: z.string().trim().min(1, "Slug is required.").max(80, "Slug must not exceed 80 characters.").optional(),
    sortOrder: normalizedSortOrderSchema.optional(),
  })
  .refine(
    (value) =>
      value.description !== undefined ||
      value.name !== undefined ||
      value.slug !== undefined ||
      value.sortOrder !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type TagDto = {
  createdAt: string;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  updatedAt: string;
  usageCount: number;
};

export type CreateTagInput = z.infer<typeof createTagBodySchema>;
export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;
export type UpdateTagInput = z.infer<typeof updateTagBodySchema>;

export function toTagDto(tag: TagRecord): TagDto {
  return {
    createdAt: tag.createdAt.toISOString(),
    description: tag.description,
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    sortOrder: tag.sortOrder,
    updatedAt: tag.updatedAt.toISOString(),
    usageCount: tag._count.articleTags,
  };
}
