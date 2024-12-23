import { z } from "zod";

import { REGEX } from "@/constants/regex";

export const getBlogsSchema = z.object({
  title: z.string().optional(),
  page: z.number().min(1, { message: "page最小为1" }),
  pageSize: z
    .number()
    .min(10, { message: "pageSize最小为10" })
    .max(50, { message: "pageSize最大为50" }),
});

export type GetBlogsRequestType = z.infer<typeof getBlogsSchema>;

export const createBlogSchema = z.object({
  title: z.string().min(1, { message: "标题必填" }),
  description: z.string().min(1, { message: "描述必填" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: "只允许输入数字、小写字母和中横线" })
    .min(1, { message: "别名必填" }),
  body: z.string().min(1, { message: "内容必填" }),
  cover: z.string().optional(),
  published: z.boolean(),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()).optional(),
});

export type CreateBlogRequestType = z.infer<typeof createBlogSchema>;

export const updateBlogSchema = z.object({
  id: z.number(),
  title: z.string().min(1, { message: "标题必填" }),
  description: z.string().min(1, { message: "描述必填" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: "只允许输入数字、小写字母和中横线" })
    .min(1, { message: "别名必填" }),
  body: z.string().min(1, { message: "内容必填" }),
  cover: z.string().optional(),
  published: z.boolean(),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()).optional(),
});

export type UpdateBlogRequestType = z.infer<typeof updateBlogSchema>;
