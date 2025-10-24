import { z } from "zod";

import { REGEX } from "@/constants";

import {
  type BaseResponse,
  type DbBlog,
  type DbNote,
  type DbTag,
} from "./base";

export const createTagSchema = z.object({
  name: z.string().min(1, { message: "长度不能少于1个字符" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: "只允许输入数字、小写字母和中横线" })
    .min(1, { message: "长度不能少于1个字符" }),
  icon: z.string().optional(),
  iconDark: z.string().optional(),
});

export const updateTagSchema = createTagSchema.partial().extend({
  id: z.string().min(1),
});

export const getTagsSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  pageIndex: z.coerce.number(),
  pageSize: z.coerce.number(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateTagRequest = z.infer<typeof createTagSchema>;
export type UpdateTagRequest = z.infer<typeof updateTagSchema>;
export type GetTagsRequest = z.infer<typeof getTagsSchema>;

export type Tag = DbTag & {
  _count: {
    blogs: number;
    snippets: number;
    notes: number;
  };
  blogs: DbBlog[];
  notes: DbNote[];
};

export type GetTagsData = {
  tags: Tag[];
  total: number;
};

export type GetTagsResponse = BaseResponse<GetTagsData>;

export type GetTagData = Tag;

export type CreateTagData = Tag;

export type CreateTagResponse = BaseResponse<Tag>;

export type UpdateTagData = Tag;

export type UpdateTagResponse = BaseResponse<UpdateTagData>;
