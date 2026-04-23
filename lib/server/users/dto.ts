import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const userRoleSchema = z.enum(["admin", "user"]);
const adminUserSortBySchema = z.enum([
  "createdAt",
  "updatedAt",
  "name",
  "email",
]);

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  role: userRoleSchema.optional(),
  sortBy: adminUserSortBySchema.default("createdAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const adminUserIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const adminUserRoleUpdateSchema = z.object({
  role: userRoleSchema,
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserIdParams = z.infer<typeof adminUserIdParamsSchema>;
export type AdminUserRoleUpdateInput = z.infer<
  typeof adminUserRoleUpdateSchema
>;
