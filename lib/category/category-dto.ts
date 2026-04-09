import { z } from "zod";

type CategoryRecord = {
  _count: {
    articles: number;
  };
  color: string | null;
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

const normalizedColorSchema = z.preprocess((value) => {
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
}, z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color.").nullable().optional());

const normalizedSortOrderSchema = z.coerce
  .number({
    error: "Sort order must be a number.",
  })
  .int("Sort order must be an integer.")
  .min(0, "Sort order must be at least 0.");

const normalizedStringIdSchema = z
  .string({
    error: "Category id must be a string.",
  })
  .trim()
  .min(1, "Category id is required.")
  .max(191, "Category id is too long.");

export const categoryIdSchema = normalizedStringIdSchema;

export const listCategoriesQuerySchema = z.object({
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

export const createCategoryBodySchema = z.object({
  color: normalizedColorSchema,
  description: normalizedDescriptionSchema,
  name: z.string().trim().min(1, "Name is required.").max(80, "Name must not exceed 80 characters."),
  slug: z.string().trim().min(1, "Slug is required.").max(80, "Slug must not exceed 80 characters."),
  sortOrder: normalizedSortOrderSchema.default(0),
});

export const updateCategoryBodySchema = z
  .object({
    color: normalizedColorSchema,
    description: normalizedDescriptionSchema,
    name: z.string().trim().min(1, "Name is required.").max(80, "Name must not exceed 80 characters.").optional(),
    slug: z.string().trim().min(1, "Slug is required.").max(80, "Slug must not exceed 80 characters.").optional(),
    sortOrder: normalizedSortOrderSchema.optional(),
  })
  .refine(
    (value) =>
      value.color !== undefined ||
      value.description !== undefined ||
      value.name !== undefined ||
      value.slug !== undefined ||
      value.sortOrder !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type CategoryDto = {
  color: string | null;
  createdAt: string;
  description: string | null;
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  updatedAt: string;
  usageCount: number;
};

export type CreateCategoryInput = z.infer<typeof createCategoryBodySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryBodySchema>;

export function toCategoryDto(category: CategoryRecord): CategoryDto {
  return {
    color: category.color,
    createdAt: category.createdAt.toISOString(),
    description: category.description,
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    updatedAt: category.updatedAt.toISOString(),
    usageCount: category._count.articles,
  };
}
