import { z } from "zod";

import { REGEX } from "@/constants";

import { type BaseResponse, type DbBlog, type DbCategory } from "./base";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "长度不能少于1个字符" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: "只允许输入数字、小写字母和中横线" })
    .min(1, { message: "长度不能少于1个字符" }),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export const getCategoriesSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  pageIndex: z.coerce.number(),
  pageSize: z.coerce.number(),
  orderBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
export type GetCategoriesRequest = z.infer<typeof getCategoriesSchema>;

export type Category = DbCategory & {
  _count: {
    blogs: number;
  };
  blogs: DbBlog[];
};

export type GetCategoriesData = {
  categories: Category[];
  total: number;
};

export type GetCategoriesResponse = BaseResponse<GetCategoriesData>;

export type GetCategoryData = Category;

export type CreateCategoryData = Category;

export type CreateCategoryResponse = BaseResponse<Category>;

export type UpdateCategoryData = Category;

export type UpdateCategoryResponse = BaseResponse<UpdateCategoryData>;
