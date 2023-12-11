import { type infer as Infer, z } from 'zod';

import { REGEX } from '@/constants/regex';

export const createArticleReqSchema = z.object({
  title: z.string().min(1, { message: '长度不能少于1个字符' }),
  friendlyURL: z
    .string()
    .regex(REGEX.FRIENDLY_URL, {
      message: '只允许输入数字、小写字母和中横线',
    })
    .min(1, { message: '长度不能少于1个字符' }),
  description: z.string().min(1, { message: '长度不能少于1个字符' }),
  cover: z.string().min(1, { message: '长度不能少于1个字符' }),
  content: z.string().min(1, { message: '长度不能少于1个字符' }),
  published: z.boolean().optional(),
  tags: z.string().array().optional(),
});

export const updateArticleReqSchema = createArticleReqSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateArticleReq = Infer<typeof createArticleReqSchema>;
export type UpdateArticleReq = Infer<typeof updateArticleReqSchema>;
