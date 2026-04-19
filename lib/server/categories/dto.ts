import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const categorySortBySchema = z.enum(["createdAt", "updatedAt", "name"]);

export const categoryCreateSchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
  description: nonEmptyString,
});

export const categoryUpdateSchema = categoryCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one category field is required",
  });

export const categoryIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const categoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  sortBy: categorySortBySchema.default("createdAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
