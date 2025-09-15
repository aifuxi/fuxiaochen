import { z } from "zod";

import { type BaseResponse, type DbBlog, type DbTag } from "@/types";

import { PUBLISHED_ENUM, REGEX } from "@/constants";

export const createBlogSchema = z.object({
  title: z.string().min(1, { message: "长度不能少于1个字符" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, {
      message: "只允许输入数字、小写字母和中横线",
    })
    .min(1, { message: "长度不能少于1个字符" }),
  description: z.string().min(1, { message: "长度不能少于1个字符" }),
  cover: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  body: z.string().min(1, { message: "长度不能少于1个字符" }),
  published: z.boolean().optional(),
  tags: z.string().array().optional(),
});

export const updateBlogSchema = createBlogSchema.partial().extend({
  id: z.string().min(1),
});

export const getBlogsSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  published: z
    .enum([
      PUBLISHED_ENUM.ALL,
      PUBLISHED_ENUM.PUBLISHED,
      PUBLISHED_ENUM.NO_PUBLISHED,
    ])
    .optional(),
  tags: z.string().array().optional(),
  pageIndex: z.coerce.number(),
  pageSize: z.coerce.number(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateBlogRequest = z.infer<typeof createBlogSchema>;
export type UpdateBlogRequest = z.infer<typeof updateBlogSchema>;
export type GetBlogsRequest = z.infer<typeof getBlogsSchema>;

export type Blog = DbBlog & {
  tags: DbTag[];
};

export type GetBlogsData = {
  blogs: Blog[];
  total: number;
};

export type GetBlogsResponse = BaseResponse<GetBlogsData>;

export type GetBlogData = Blog;

export type CreateBlogData = Blog;

export type CreateBlogResponse = BaseResponse<Blog>;

export type UpdateBlogData = Blog;

export type UpdateBlogResponse = BaseResponse<UpdateBlogData>;
