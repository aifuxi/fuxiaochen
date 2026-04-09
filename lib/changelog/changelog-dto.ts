import { ChangelogItemType } from "@/generated/prisma/enums";
import { z } from "zod";

type ChangelogItemRecord = {
  description: string | null;
  id: string;
  itemType: (typeof ChangelogItemType)[keyof typeof ChangelogItemType];
  sortOrder: number;
  title: string;
};

type ChangelogReleaseRecord = {
  createdAt: Date;
  id: string;
  isMajor: boolean;
  items: ChangelogItemRecord[];
  releasedOn: Date;
  sortOrder: number;
  summary: string | null;
  title: string;
  version: string;
};

const changelogItemTypeSchema = z.enum([
  ChangelogItemType.Added,
  ChangelogItemType.Changed,
  ChangelogItemType.Fixed,
  ChangelogItemType.Improved,
  ChangelogItemType.Removed,
]);

const normalizedStringIdSchema = z
  .string({
    error: "Changelog release id must be a string.",
  })
  .trim()
  .min(1, "Changelog release id is required.")
  .max(191, "Changelog release id is too long.");

const normalizedTextSchema = z.preprocess((value) => {
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

const normalizedSortOrderSchema = z.coerce
  .number({
    error: "Sort order must be a number.",
  })
  .int("Sort order must be an integer.")
  .min(0, "Sort order must be at least 0.");

const requiredDateSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }

  return value;
}, z.date({
  error: "Release date is required.",
}));

const normalizedBooleanFilterSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }
  }

  return value;
}, z.boolean().optional());

export const changelogReleaseIdSchema = normalizedStringIdSchema;

export const changelogItemInputSchema = z.object({
  description: normalizedTextSchema,
  itemType: changelogItemTypeSchema,
  sortOrder: normalizedSortOrderSchema.default(0),
  title: z.string().trim().min(1, "Item title is required.").max(255, "Item title must not exceed 255 characters."),
});

export const listChangelogReleasesQuerySchema = z.object({
  isMajor: normalizedBooleanFilterSchema,
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

export const createChangelogReleaseBodySchema = z.object({
  isMajor: z.boolean().default(false),
  items: z.array(changelogItemInputSchema).max(100, "Items must not exceed 100 entries.").default([]),
  releasedOn: requiredDateSchema,
  sortOrder: normalizedSortOrderSchema.default(0),
  summary: normalizedTextSchema,
  title: z.string().trim().min(1, "Title is required.").max(255, "Title must not exceed 255 characters."),
  version: z.string().trim().min(1, "Version is required.").max(32, "Version must not exceed 32 characters."),
});

export const updateChangelogReleaseBodySchema = z
  .object({
    isMajor: z.boolean().optional(),
    items: z.array(changelogItemInputSchema).max(100, "Items must not exceed 100 entries.").optional(),
    releasedOn: requiredDateSchema.optional(),
    sortOrder: normalizedSortOrderSchema.optional(),
    summary: normalizedTextSchema,
    title: z.string().trim().min(1, "Title is required.").max(255, "Title must not exceed 255 characters.").optional(),
    version: z.string().trim().min(1, "Version is required.").max(32, "Version must not exceed 32 characters.").optional(),
  })
  .refine(
    (value) =>
      value.isMajor !== undefined ||
      value.items !== undefined ||
      value.releasedOn !== undefined ||
      value.sortOrder !== undefined ||
      value.summary !== undefined ||
      value.title !== undefined ||
      value.version !== undefined,
    {
      message: "At least one field must be provided.",
      path: [],
    },
  );

export type ChangelogItemDto = {
  description: string | null;
  id: string;
  itemType: (typeof ChangelogItemType)[keyof typeof ChangelogItemType];
  sortOrder: number;
  title: string;
};

export type ChangelogReleaseDto = {
  createdAt: string;
  id: string;
  isMajor: boolean;
  items: ChangelogItemDto[];
  releasedOn: string;
  sortOrder: number;
  summary: string | null;
  title: string;
  version: string;
};

export type ChangelogItemInput = z.infer<typeof changelogItemInputSchema>;
export type CreateChangelogReleaseInput = z.infer<typeof createChangelogReleaseBodySchema>;
export type ListChangelogReleasesQuery = z.infer<typeof listChangelogReleasesQuerySchema>;
export type UpdateChangelogReleaseInput = z.infer<typeof updateChangelogReleaseBodySchema>;

export function toChangelogReleaseDto(release: ChangelogReleaseRecord): ChangelogReleaseDto {
  return {
    createdAt: release.createdAt.toISOString(),
    id: release.id,
    isMajor: release.isMajor,
    items: release.items.map((item) => ({
      description: item.description,
      id: item.id,
      itemType: item.itemType,
      sortOrder: item.sortOrder,
      title: item.title,
    })),
    releasedOn: release.releasedOn.toISOString(),
    sortOrder: release.sortOrder,
    summary: release.summary,
    title: release.title,
    version: release.version,
  };
}
