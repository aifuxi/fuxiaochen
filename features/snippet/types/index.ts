import { type Snippet as DbSnippet, type Tag as DbTag } from "@prisma/client";
import { z } from "zod";

import { type BaseResponse } from "@/types";

import { PUBLISHED_ENUM, REGEX } from "@/constants";

export const createSnippetSchema = z.object({
  title: z.string().min(1, { message: "长度不能少于1个字符" }),
  slug: z
    .string()
    .regex(REGEX.SLUG, {
      message: "只允许输入数字、小写字母和中横线",
    })
    .min(1, { message: "长度不能少于1个字符" }),
  description: z.string().min(1, { message: "长度不能少于1个字符" }),
  published: z.boolean().optional(),
  body: z.string().min(1, { message: "长度不能少于1个字符" }),
  tags: z.string().array().optional(),
});

export const updateSnippetSchema = createSnippetSchema.partial().extend({
  id: z.string().min(1),
});

export const getSnippetsSchema = z.object({
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

export type CreateSnippetRequest = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetRequest = z.infer<typeof updateSnippetSchema>;
export type GetSnippetsRequest = z.infer<typeof getSnippetsSchema>;

export type Snippet = DbSnippet & {
  tags: DbTag[];
};

export type GetSnippetsData = {
  snippets: Snippet[];
  total: number;
};

export type GetSnippetsResponse = BaseResponse<GetSnippetsData>;

export type GetSnippetData = Snippet;

export type CreateSnippetData = Snippet;

export type CreateSnippetResponse = BaseResponse<Snippet>;

export type UpdateSnippetData = Snippet;

export type UpdateSnippetResponse = BaseResponse<UpdateSnippetData>;
