import { z } from "zod";

export const pageSchema = z.coerce.number().int().min(1).max(1_000_000).default(1);
export const publicPostQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  categoryId: z.uuid().optional(),
  tagId: z.uuid().optional(),
  page: pageSchema,
});
export type PublicPostQuery = z.infer<typeof publicPostQuerySchema>;
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

export function publicPostParams(query: PublicPostQuery, page = query.page) {
  return {
    q: query.q || undefined,
    categoryId: query.categoryId,
    tagId: query.tagId,
    page: page > 1 ? String(page) : undefined,
  };
}

export function queryPath(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return query.size ? `${path}?${query}` : path;
}

export function queryNeedsRedirect(
  params: SearchParams,
  normalized: Record<string, string | undefined>,
) {
  const expected = Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined),
  );
  const actual = Object.entries(params).filter(
    ([key, value]) => Object.hasOwn(normalized, key) && value !== undefined,
  );
  return (
    actual.length !== Object.keys(expected).length ||
    actual.some(([key, value]) => Array.isArray(value) || value !== expected[key])
  );
}

export function normalizedQueryPath(
  path: string,
  params: SearchParams,
  normalized: Record<string, string | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(normalized))
    if (value !== undefined) query.set(key, value);
  // 页码规范化时保留追踪参数，canonical 另用 queryPath 仅包含业务条件。
  for (const [key, value] of Object.entries(params)) {
    if (Object.hasOwn(normalized, key) || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
  }
  return query.size ? `${path}?${query}` : path;
}
