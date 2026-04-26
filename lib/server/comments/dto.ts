import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const optionalSearchQuery = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length === 0 ? undefined : value,
  nonEmptyString.optional(),
);

const commentStatusSchema = z.enum(["pending", "approved", "spam"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);
const adminCommentSortBySchema = z.enum([
  "createdAt",
  "updatedAt",
  "author",
  "status",
]);

const adminCommentMutationFields = {
  author: nonEmptyString.max(120),
  email: z.string().trim().email(),
  content: nonEmptyString.max(5000),
  status: commentStatusSchema,
} as const;

export const publicCommentListQuerySchema = z.object({
  postSlug: nonEmptyString.max(200),
});

export const publicCommentCreateSchema = z.object({
  postSlug: nonEmptyString.max(200),
  author: nonEmptyString.max(120),
  email: z.string().trim().email(),
  content: nonEmptyString.max(5000),
  parentId: nonEmptyString.optional(),
  website: z.string().trim().max(200).optional(),
  startedAt: z.coerce.number().int().positive(),
});

export const adminCommentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: optionalSearchQuery,
  status: commentStatusSchema.optional(),
  postSlug: nonEmptyString.max(200).optional(),
  sortBy: adminCommentSortBySchema.default("createdAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});

export const adminCommentIdParamsSchema = z.object({
  id: nonEmptyString,
});

export const adminCommentUpdateSchema = z
  .object(adminCommentMutationFields)
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    {
      message: "At least one comment field is required",
    },
  );

export const adminCommentReplySchema = z.object({
  parentId: nonEmptyString,
  content: nonEmptyString.max(5000),
});

export type CommentStatusInput = z.infer<typeof commentStatusSchema>;
export type PublicCommentListQuery = z.infer<
  typeof publicCommentListQuerySchema
>;
export type PublicCommentCreateInput = z.infer<
  typeof publicCommentCreateSchema
>;
export type AdminCommentListQuery = z.infer<typeof adminCommentListQuerySchema>;
export type AdminCommentIdParams = z.infer<typeof adminCommentIdParamsSchema>;
export type AdminCommentUpdateInput = z.infer<typeof adminCommentUpdateSchema>;
export type AdminCommentReplyInput = z.infer<typeof adminCommentReplySchema>;
