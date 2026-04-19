import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const tagSortBySchema = z.enum(["createdAt", "updatedAt", "name"]);

export const tagCreateSchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
  description: nonEmptyString,
});

export const tagUpdateSchema = tagCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one tag field is required",
  });

export const tagIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const tagListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: nonEmptyString.optional(),
  sortBy: tagSortBySchema.default("updatedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
export type TagIdParams = z.infer<typeof tagIdParamsSchema>;
export type TagListQuery = z.infer<typeof tagListQuerySchema>;
