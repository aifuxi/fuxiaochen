import { type infer as Infer, z } from 'zod';

import { REGEX } from '@/config';

import { type getSnippets } from '../actions';

export const createSnippetSchema = z.object({
  title: z.string().min(1, { message: '长度不能少于1个字符' }),
  slug: z
    .string()
    .regex(REGEX.SLUG, {
      message: '只允许输入数字、小写字母和中横线',
    })
    .min(1, { message: '长度不能少于1个字符' }),
  description: z.string().min(1, { message: '长度不能少于1个字符' }),
  body: z.string().min(1, { message: '长度不能少于1个字符' }),
  tags: z.string().array().optional(),
});

export const updateSnippetSchema = createSnippetSchema.partial().extend({
  id: z.string().min(1),
});

export const getSnippetsSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  pageIndex: z.number(),
  pageSize: z.number(),
  orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateSnippetDTO = Infer<typeof createSnippetSchema>;
export type UpdateSnippetDTO = Infer<typeof updateSnippetSchema>;
export type GetSnippetsDTO = z.infer<typeof getSnippetsSchema>;

export type Snippet = Awaited<
  ReturnType<typeof getSnippets>
>['snippets'][number];
