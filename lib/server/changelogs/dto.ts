import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);
const dateLikeSchema = z
  .union([z.date(), z.string(), z.number()])
  .pipe(z.coerce.date());
const changelogTypeSchema = z.enum([
  "feature",
  "improvement",
  "bugfix",
  "breaking",
]);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const changelogSortBySchema = z.enum(["releaseDate", "updatedAt", "version"]);

export const adminChangelogCreateSchema = z.object({
  version: nonEmptyString,
  title: nonEmptyString,
  releaseDate: dateLikeSchema,
  type: changelogTypeSchema,
  description: nonEmptyString,
  changes: z.array(nonEmptyString).default([]),
});

export const adminChangelogUpdateSchema = adminChangelogCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one changelog field is required",
  });

export const adminChangelogIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const publicChangelogVersionParamsSchema = z.object({
  version: nonEmptyString,
});

export const changelogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  type: changelogTypeSchema.optional(),
  sortBy: changelogSortBySchema.default("releaseDate"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type AdminChangelogCreateInput = z.infer<
  typeof adminChangelogCreateSchema
>;
export type AdminChangelogUpdateInput = z.infer<
  typeof adminChangelogUpdateSchema
>;
export type AdminChangelogIdParams = z.infer<
  typeof adminChangelogIdParamsSchema
>;
export type PublicChangelogVersionParams = z.infer<
  typeof publicChangelogVersionParamsSchema
>;
export type ChangelogListQuery = z.infer<typeof changelogListQuerySchema>;
