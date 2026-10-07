import { z } from "zod";

import { draftContentSchema, postContentSchema } from "./document";

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
const summarySchema = z.string().trim().max(200, "摘要最多 200 个字符");
const featuredOrderSchema = z
  .number({ error: "请输入有效的精选排序数字" })
  .int("精选排序必须是整数")
  .min(0, "精选排序不能小于 0")
  .max(9999, "精选排序不能大于 9999");
const postFields = z.object({
  slug: z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? null : value),
    slugSchema.nullable(),
  ),
  title: z.string().trim().max(120, "标题最多 120 个字符"),
  content: draftContentSchema,
  summary: summarySchema.default(""),
  isFeatured: z.boolean().default(false),
  featuredOrder: featuredOrderSchema.default(0),
  categoryId: z.preprocess(
    (value) => (value === "" ? null : value),
    z.uuid("请选择已登记的分类").nullable(),
  ),
  tagIds: z.array(z.uuid("标签 ID 无效")).transform((ids) => [...new Set(ids)]),
  status: postStatusSchema,
  scheduledFor: z.iso.datetime({ offset: true }).nullable(),
});
const validateSchedule = (
  input: {
    status: PostStatus;
    scheduledFor: string | null;
    title: string;
    slug: string | null;
    categoryId: string | null;
    content: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (input.status !== "draft") {
    if (!input.title)
      ctx.addIssue({ code: "custom", path: ["title"], message: "发布前请输入文章标题" });
    if (!input.slug) ctx.addIssue({ code: "custom", path: ["slug"], message: "发布前请输入 slug" });
    if (!input.categoryId)
      ctx.addIssue({ code: "custom", path: ["categoryId"], message: "发布前请选择分类" });
    const content = postContentSchema.safeParse(input.content);
    if (!content.success)
      ctx.addIssue({ code: "custom", path: ["content"], message: content.error.issues[0].message });
  }
  if (input.status === "scheduled" && !input.scheduledFor)
    ctx.addIssue({ code: "custom", path: ["scheduledFor"], message: "请选择计划发布时间" });
  if (input.status !== "scheduled" && input.scheduledFor !== null)
    ctx.addIssue({
      code: "custom",
      path: ["scheduledFor"],
      message: "非排期文章不能设置排期时间",
    });
};
export const postSchema = postFields.superRefine(validateSchedule);
const version = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
export const updatePostSchema = postFields
  .extend({
    version,
    summary: summarySchema.optional(),
    isFeatured: z.boolean().optional(),
    featuredOrder: featuredOrderSchema.optional(),
  })
  .superRefine(validateSchedule);
export const featuredPostSchema = z.strictObject({ isFeatured: z.boolean(), version });
export type FeaturedPostInput = z.infer<typeof featuredPostSchema>;
export const postIdSchema = z.object({ id: z.uuid() });
export const deletePostSchema = z.object({ version: z.coerce.number().pipe(version) });
export const postQuerySchema = z.object({
  featured: z.enum(["all", "featured", "unfeatured"]).default("all"),
  sortBy: z.enum(["title", "category", "status", "time"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
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
  summary: string;
  isFeatured: boolean;
  featuredOrder: number;
  slug: string | null;
  slugLockedAt: string | null;
  categoryId: string | null;
  category: { id: string; name: string; color: string } | null;
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
export type PostSummary = {
  statusCounts: PostCounts;
  schedules: PostItem[];
  recentDrafts: PostItem[];
};
export const emptyPostCounts: PostCounts = { all: 0, draft: 0, published: 0, scheduled: 0 };
export const postDisplayTitle = (title: string) => title.trim() || "未命名草稿";
export function postTime(value: string | null, dateOnly = false) {
  if (!value) return "—";
  return new Date(value)
    .toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" })
    .slice(0, dateOnly ? 10 : 16);
}
export function postLocalTime(value: string | null) {
  return value ? postTime(value).replace(" ", "T") : "";
}
