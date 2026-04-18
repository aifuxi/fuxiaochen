import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  });

export const changelogCreateSchema = z.object({
  version: nonEmptyString,
  content: nonEmptyString,
  releaseDate: isoDateString.nullable().optional(),
});

export const changelogUpdateSchema = changelogCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one changelog field is required",
  });

export const changelogIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const changelogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ChangelogCreateInput = z.infer<typeof changelogCreateSchema>;
export type ChangelogUpdateInput = z.infer<typeof changelogUpdateSchema>;
export type ChangelogIdParams = z.infer<typeof changelogIdParamsSchema>;
export type ChangelogListQuery = z.infer<typeof changelogListQuerySchema>;
