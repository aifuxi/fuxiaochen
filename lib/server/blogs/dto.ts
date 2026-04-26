import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);

const booleanLikeSchema = z.union([
  z.boolean(),
  z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => ["true", "false", "1", "0"].includes(value), {
      message: "Invalid boolean value",
    })
    .transform((value) => value === "true" || value === "1"),
]);

const dateLikeSchema = z
  .union([z.date(), z.string(), z.number()])
  .pipe(z.coerce.date());

const optionalBoolean = booleanLikeSchema.optional();
const optionalDate = dateLikeSchema.nullable().optional();
const optionalSlug = z.string().trim().min(1).max(200).optional();
const optionalTagIds = z.array(nonEmptyString).optional();

const adminBlogSortBySchema = z.enum(["publishedAt", "updatedAt", "title"]);
const publicBlogSortBySchema = z.enum(["date", "title"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);

const adminMutationFields = {
  title: nonEmptyString,
  slug: optionalSlug,
  description: nonEmptyString,
  content: nonEmptyString,
  coverImage: z.string().trim().optional(),
  featured: optionalBoolean,
  published: optionalBoolean,
  publishedAt: optionalDate,
  categoryId: nonEmptyString,
  tagIds: optionalTagIds,
} as const;

export const adminBlogCreateSchema = z.object({
  ...adminMutationFields,
  coverImage: z.string().trim().default(""),
  featured: optionalBoolean.default(false),
  published: optionalBoolean.default(false),
  tagIds: z.array(nonEmptyString).default([]),
});

export const adminBlogUpdateSchema = z
  .object(adminMutationFields)
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    {
      message: "At least one blog field is required",
    },
  );

export const adminBlogIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const adminBlogSlugParamsSchema = z.object({
  slug: nonEmptyString,
});

export const publicBlogSlugParamsSchema = z.object({
  slug: nonEmptyString,
});

export const adminBlogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  categoryId: nonEmptyString.optional(),
  tagId: nonEmptyString.optional(),
  featured: optionalBoolean,
  published: optionalBoolean,
  sortBy: adminBlogSortBySchema.default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const publicBlogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  category: nonEmptyString.optional(),
  tag: nonEmptyString.optional(),
  featured: optionalBoolean,
  sortBy: publicBlogSortBySchema.default("date"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const publicSimilarBlogQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(12).default(3),
});

export type AdminBlogCreateInput = z.infer<typeof adminBlogCreateSchema>;
export type AdminBlogUpdateInput = z.infer<typeof adminBlogUpdateSchema>;
export type AdminBlogIdParams = z.infer<typeof adminBlogIdParamsSchema>;
export type AdminBlogSlugParams = z.infer<typeof adminBlogSlugParamsSchema>;
export type PublicBlogSlugParams = z.infer<typeof publicBlogSlugParamsSchema>;
export type AdminBlogListQuery = z.infer<typeof adminBlogListQuerySchema>;
export type PublicBlogListQuery = z.infer<typeof publicBlogListQuerySchema>;
export type PublicSimilarBlogQuery = z.infer<
  typeof publicSimilarBlogQuerySchema
>;
