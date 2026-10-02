import { z } from "zod";

export const commentStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type CommentStatus = z.infer<typeof commentStatusSchema>;
export const commentStatusLabels: Record<CommentStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};
export const COMMENT_MAX_LENGTH = 2000;
const content = z
  .string()
  .trim()
  .min(1, "请输入评论内容。")
  .max(COMMENT_MAX_LENGTH, "评论最多 2000 个字符。");
const version = z
  .number()
  .int()
  .min(1)
  .max(Number.MAX_SAFE_INTEGER - 1);
export const commentSchema = z.strictObject({
  postId: z.uuid("文章 ID 无效。"),
  author: z.string().trim().min(1, "请输入留言者名称。").max(80, "留言者名称最多 80 个字符。"),
  email: z.email("邮箱格式无效。").max(254),
  content,
});
export const moderateCommentSchema = z.strictObject({
  status: z.enum(["approved", "rejected"]),
  version,
});
export const replyCommentSchema = z.strictObject({ content, version });
export const commentIdSchema = z.object({ id: z.uuid() });
export const deleteCommentSchema = z.object({ version: z.coerce.number().pipe(version) });
export const commentQuerySchema = z.object({
  q: z.string().trim().max(200, "关键词最多 200 个字符。").default(""),
  status: commentStatusSchema.optional(),
  postId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(8),
});
export type CommentInput = z.infer<typeof commentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;
export type ReplyCommentInput = z.infer<typeof replyCommentSchema>;
export type CommentItem = {
  id: string;
  postId: string;
  postTitle: string;
  parentId: string | null;
  parent: { id: string; author: string; status: CommentStatus } | null;
  author: string;
  email: string | null;
  content: string;
  status: CommentStatus;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
};
export type CommentCounts = Record<CommentStatus | "all", number>;
export type CommentList = {
  items: CommentItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  statusCounts: CommentCounts;
};
export type CommentSummary = { statusCounts: CommentCounts; pending: CommentItem[] };
