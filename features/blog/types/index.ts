import { z } from 'zod';

import { PUBLISHED_ENUM, REGEX } from '@/constants';

import { type getBlogs } from '../actions';

export const createBlogSchema = z.object({
  title: z.string().min(1, { message: '长度不能少于1个字符' }),
  slug: z
    .string()
    .regex(REGEX.SLUG, {
      message: '只允许输入数字、小写字母和中横线',
    })
    .min(1, { message: '长度不能少于1个字符' }),
  description: z.string().min(1, { message: '长度不能少于1个字符' }),
  cover: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  body: z.string().min(1, { message: '长度不能少于1个字符' }),
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
  pageIndex: z.number(),
  pageSize: z.number(),
  orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateBlogDTO = z.infer<typeof createBlogSchema>;
export type UpdateBlogDTO = z.infer<typeof updateBlogSchema>;
export type GetBlogsDTO = z.infer<typeof getBlogsSchema>;

export type Blog = Awaited<ReturnType<typeof getBlogs>>['blogs'][number];
