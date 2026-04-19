import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

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
const optionalTagIds = z.array(nonEmptyString).optional();
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const blogSortBySchema = z.enum(["publishedAt", "updatedAt", "title"]);

const blogMutationFields = {
  title: nonEmptyString,
  slug: nonEmptyString,
  description: nonEmptyString,
  content: nonEmptyString,
  categoryId: nonEmptyString,
  cover: z.string().trim().optional(),
  published: optionalBoolean,
  publishedAt: optionalDate,
  featured: optionalBoolean,
  tagIds: optionalTagIds,
} as const;

export const blogCreateSchema = z.object({
  ...blogMutationFields,
  cover: z.string().trim().default(""),
  published: optionalBoolean.default(false),
  featured: optionalBoolean.default(false),
});

export const blogUpdateSchema = z
  .object(blogMutationFields)
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    {
      message: "At least one blog field is required",
    },
  );

export const blogIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const blogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  published: optionalBoolean,
  featured: optionalBoolean,
  categoryId: nonEmptyString.optional(),
  sortBy: blogSortBySchema.default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type BlogCreateInput = z.infer<typeof blogCreateSchema>;
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>;
export type BlogIdParams = z.infer<typeof blogIdParamsSchema>;
export type BlogListQuery = z.infer<typeof blogListQuerySchema>;
