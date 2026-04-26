import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);
const optionalUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  z.string().trim().url().optional(),
);
const optionalDescription = z.string().trim().optional();

const friendCategorySchema = z.enum([
  "developer",
  "designer",
  "blogger",
  "creator",
]);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const adminFriendSortBySchema = z.enum(["name", "category", "updatedAt"]);

export const adminFriendCreateSchema = z.object({
  name: nonEmptyString,
  url: z.string().trim().url(),
  avatar: optionalUrl,
  description: optionalDescription,
  category: friendCategorySchema,
});

export const adminFriendUpdateSchema = adminFriendCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one friend field is required",
  });

export const adminFriendIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const adminFriendListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  category: friendCategorySchema.optional(),
  sortBy: adminFriendSortBySchema.default("updatedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type FriendCategory = z.infer<typeof friendCategorySchema>;
export type AdminFriendCreateInput = z.infer<typeof adminFriendCreateSchema>;
export type AdminFriendUpdateInput = z.infer<typeof adminFriendUpdateSchema>;
export type AdminFriendIdParams = z.infer<typeof adminFriendIdParamsSchema>;
export type AdminFriendListQuery = z.infer<typeof adminFriendListQuerySchema>;
