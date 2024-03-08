import { z } from 'zod';

import { REGEX } from '@/config';

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

export type CreateTagDTO = z.infer<typeof createTagSchema>;
export type UpdateTagDTO = z.infer<typeof updateTagSchema>;
