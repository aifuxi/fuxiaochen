import { type infer as Infer, z } from 'zod';

import { REGEX } from '@/config';

export const createArticleSchema = z.object({
  title: z.string().min(1, { message: '长度不能少于1个字符' }),
  slug: z
    .string()
    .regex(REGEX.SLUG, {
      message: '只允许输入数字、小写字母和中横线',
    })
    .min(1, { message: '长度不能少于1个字符' }),
  description: z.string().min(1, { message: '长度不能少于1个字符' }),
  cover: z.string().min(1, { message: '长度不能少于1个字符' }).optional(),
  content: z.string().min(1, { message: '长度不能少于1个字符' }),
  published: z.boolean().optional(),
  tags: z.string().array().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateArticleDTO = Infer<typeof createArticleSchema>;
export type UpdateArticleDTO = Infer<typeof updateArticleSchema>;
