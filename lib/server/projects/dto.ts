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
const nullableUrl = z.string().url().nullable().optional();

const sortDirectionSchema = z.enum(["asc", "desc"]);
const adminProjectSortBySchema = z.enum(["year", "updatedAt", "title"]);
const publicProjectSortBySchema = z.enum(["year", "title"]);

export const adminProjectCreateSchema = z.object({
  title: nonEmptyString,
  slug: optionalSlug,
  description: nonEmptyString,
  longDescription: nonEmptyString,
  image: z.string().trim().default(""),
  tags: z.array(nonEmptyString).default([]),
  githubUrl: nullableUrl,
  liveUrl: nullableUrl,
  featured: optionalBoolean.default(false),
  published: optionalBoolean.default(false),
  year: z.coerce.number().int().min(1900).max(2999),
});

export const adminProjectUpdateSchema = adminProjectCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one project field is required",
  });

export const adminProjectIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const publicProjectSlugParamsSchema = z.object({
  slug: nonEmptyString,
});

export const adminProjectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  featured: optionalBoolean,
  published: optionalBoolean,
  year: z.coerce.number().int().min(1900).max(2999).optional(),
  sortBy: adminProjectSortBySchema.default("updatedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const publicProjectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  featured: optionalBoolean,
  year: z.coerce.number().int().min(1900).max(2999).optional(),
  tag: nonEmptyString.optional(),
  sortBy: publicProjectSortBySchema.default("year"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type AdminProjectCreateInput = z.infer<typeof adminProjectCreateSchema>;
export type AdminProjectUpdateInput = z.infer<typeof adminProjectUpdateSchema>;
export type AdminProjectIdParams = z.infer<typeof adminProjectIdParamsSchema>;
export type PublicProjectSlugParams = z.infer<
  typeof publicProjectSlugParamsSchema
>;
export type AdminProjectListQuery = z.infer<typeof adminProjectListQuerySchema>;
export type PublicProjectListQuery = z.infer<
  typeof publicProjectListQuerySchema
>;
