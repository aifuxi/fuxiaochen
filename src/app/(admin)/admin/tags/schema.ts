import { z } from "zod";

import { REGEX } from "@/constants/regex";

export const getTagsSchema = z.object({
  name: z.string().optional(),
  page: z.number().min(1, { message: "page最小为1" }),
  pageSize: z
    .number()
    .min(10, { message: "pageSize最小为10" })
    .max(50, { message: "pageSize最大为50" }),
});

export type GetTagsRequestType = z.infer<typeof getTagsSchema>;

export const createTagSchema = z.object({
  name: z.string().min(1, { message: "名称必填" }),
  description: z.string().min(1, { message: "描述必填" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: "只允许输入数字、小写字母和中横线" })
    .min(1, { message: "别名必填" }),
  icon: z.string().optional(),
  iconDark: z.string().optional(),
});

export type CreateTagRequestType = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "名称必填" }),
  description: z.string().min(1, { message: "描述必填" }),
  slug: z.string().min(1, { message: "别名必填" }),
  icon: z.string().optional(),
  iconDark: z.string().optional(),
});

export type UpdateTagRequestType = z.infer<typeof updateTagSchema>;
