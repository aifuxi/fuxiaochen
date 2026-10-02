import { z } from "zod";

export const postStatusSchema = z.enum(["draft", "published", "scheduled"]);
export type PostStatus = z.infer<typeof postStatusSchema>;
export const postStatusLabels: Record<PostStatus, string> = {
  draft: "草稿",
  published: "已发布",
  scheduled: "已排期",
};
export const slugSchema = z
  .string()
  .trim()
  .min(1, "请输入 slug")
  .max(120, "slug 最多 120 个字符")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 仅支持小写英文字母、数字和单个连字符");
export const postSchema = z
  .object({
    slug: slugSchema,
    title: z.string().trim().min(1, "请输入文章标题").max(120, "标题最多 120 个字符"),
    content: z
      .string()
      .max(100_000, "正文最多 100,000 个字符")
      .refine((value) => Boolean(value.trim()), "请输入正文内容"),
    categoryId: z.uuid("请选择已登记的分类"),
    tagIds: z.array(z.uuid("标签 ID 无效")).transform((ids) => [...new Set(ids)]),
    status: postStatusSchema,
    scheduledFor: z.iso.datetime({ offset: true }).nullable(),
  })
  .superRefine((input, ctx) => {
    if (input.status === "scheduled" && !input.scheduledFor)
      ctx.addIssue({ code: "custom", path: ["scheduledFor"], message: "请选择计划发布时间" });
    if (input.status !== "scheduled" && input.scheduledFor !== null)
      ctx.addIssue({
        code: "custom",
        path: ["scheduledFor"],
        message: "非排期文章不能设置排期时间",
      });
  });
const version = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
export const updatePostSchema = postSchema.safeExtend({ version });
export const postIdSchema = z.object({ id: z.uuid() });
export const deletePostSchema = z.object({ version: z.coerce.number().pipe(version) });
export const postQuerySchema = z.object({
  q: z.string().trim().max(200, "关键词最多 200 个字符").default(""),
  status: postStatusSchema.optional(),
  categoryId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(8),
});
export type PostInput = z.infer<typeof postSchema>;
export type PostUpdateInput = z.infer<typeof updatePostSchema>;
export type PostQuery = z.infer<typeof postQuerySchema>;
export type PostItem = {
  id: string;
  title: string;
  slug: string;
  slugLockedAt: string | null;
  categoryId: string;
  category: { id: string; name: string; color: string };
  tags: { id: string; name: string }[];
  status: PostStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledFor: string | null;
};
export type PostDetail = PostItem & { content: string };
export type PostCounts = Record<PostStatus | "all", number>;
export type PostList = {
  items: PostItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  statusCounts: PostCounts;
};
export type PostSummary = { statusCounts: PostCounts; schedules: PostItem[] };
export const emptyPostCounts: PostCounts = { all: 0, draft: 0, published: 0, scheduled: 0 };
export function postTime(value: string | null, dateOnly = false) {
  if (!value) return "—";
  return new Date(value)
    .toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" })
    .slice(0, dateOnly ? 10 : 16);
}
export function postLocalTime(value: string | null) {
  return value ? postTime(value).replace(" ", "T") : "";
}
