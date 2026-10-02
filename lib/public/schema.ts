import { z } from "zod";

export const pageSchema = z.coerce.number().int().min(1).max(1_000_000).default(1);
export const publicPostQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  categoryId: z.uuid().optional(),
  tagId: z.uuid().optional(),
  page: pageSchema,
});
export const publicCommentSchema = z.strictObject({
  author: z.string().trim().min(1, "请输入昵称。").max(80, "昵称最多 80 个字符。"),
  email: z
    .email("请输入有效的邮箱。")
    .max(254, "邮箱最多 254 个字符。")
    .transform((value) => value.toLowerCase()),
  content: z.string().trim().min(1, "请输入评论内容。").max(2000, "评论最多 2000 个字符。"),
  parentId: z.uuid().nullable().default(null),
  submissionId: z.uuid(),
});
export type PublicCommentInput = z.infer<typeof publicCommentSchema>;
export type PublicComment = {
  id: string;
  author: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  parent: { id: string; author: string } | null;
};
export type PublicCommentList = {
  items: PublicComment[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};
export type SearchParams = Record<string, string | string[] | undefined>;
export function singleParams(params: SearchParams) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}
