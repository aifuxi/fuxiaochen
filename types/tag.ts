import { z } from 'zod';

import { REGEX } from '@/constants/regex';

export const createTagReqSchema = z.object({
  name: z.string().min(1, { message: '长度不能少于1个字符' }),
  slug: z
    .string()
    .regex(REGEX.SLUG, { message: '只允许输入数字、小写字母和中横线' })
    .min(1, { message: '长度不能少于1个字符' }),
});

export const updateTagReqSchema = createTagReqSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateTagReq = z.infer<typeof createTagReqSchema>;
export type UpdateTagReq = z.infer<typeof updateTagReqSchema>;
