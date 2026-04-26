import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);
const optionalBoolean = z
  .union([
    z.boolean(),
    z
      .string()
      .trim()
      .toLowerCase()
      .refine((value) => ["true", "false", "1", "0"].includes(value), {
        message: "Invalid boolean value",
      })
      .transform((value) => value === "true" || value === "1"),
  ])
  .optional();
const slugSchema = z.string().trim().min(1).max(200);

const sortDirectionSchema = z.enum(["asc", "desc"]);
const adminCategorySortBySchema = z.enum(["name", "postCount", "updatedAt"]);

export const adminCategoryCreateSchema = z.object({
  name: nonEmptyString,
  slug: slugSchema,
});

export const adminCategoryUpdateSchema = adminCategoryCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one category field is required",
  });

export const adminCategoryIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const adminCategoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  includeCounts: optionalBoolean.default(true),
  sortBy: adminCategorySortBySchema.default("updatedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type AdminCategoryCreateInput = z.infer<
  typeof adminCategoryCreateSchema
>;
export type AdminCategoryUpdateInput = z.infer<
  typeof adminCategoryUpdateSchema
>;
export type AdminCategoryIdParams = z.infer<typeof adminCategoryIdParamsSchema>;
export type AdminCategoryListQuery = z.infer<
  typeof adminCategoryListQuerySchema
>;
