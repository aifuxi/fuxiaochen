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
const optionalSlug = z.string().trim().min(1).max(200).optional();

const sortDirectionSchema = z.enum(["asc", "desc"]);
const adminTagSortBySchema = z.enum(["name", "postCount", "updatedAt"]);

export const adminTagCreateSchema = z.object({
  name: nonEmptyString,
  slug: optionalSlug,
  description: z.string().trim().optional(),
});

export const adminTagUpdateSchema = adminTagCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one tag field is required",
  });

export const adminTagIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const adminTagListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  includeCounts: optionalBoolean.default(true),
  sortBy: adminTagSortBySchema.default("updatedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type AdminTagCreateInput = z.infer<typeof adminTagCreateSchema>;
export type AdminTagUpdateInput = z.infer<typeof adminTagUpdateSchema>;
export type AdminTagIdParams = z.infer<typeof adminTagIdParamsSchema>;
export type AdminTagListQuery = z.infer<typeof adminTagListQuerySchema>;
