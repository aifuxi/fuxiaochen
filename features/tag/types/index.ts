import { z } from 'zod';

import { REGEX } from '@/constants';

import { type getTags } from '../actions';

export const createTagSchema = z.object({
  name: z.string().min(1, { message: '长度不能少于1个字符' }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: '只允许输入数字、小写字母和中横线' })
    .min(1, { message: '长度不能少于1个字符' }),
});

export const updateTagSchema = createTagSchema.partial().extend({
  id: z.string().min(1),
});

export const getTagsSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  pageIndex: z.number(),
  pageSize: z.number(),
  orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateTagDTO = z.infer<typeof createTagSchema>;
export type UpdateTagDTO = z.infer<typeof updateTagSchema>;
export type GetTagsDTO = z.infer<typeof getTagsSchema>;

export type Tag = Awaited<ReturnType<typeof getTags>>['tags'][number];
