import { z } from 'zod';

import { type getNotes } from '../actions';

export const createNoteSchema = z.object({
  body: z.string().min(1, { message: '长度不能少于1个字符' }),
  published: z.boolean().optional(),
  tags: z.string().array().optional(),
});

export const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string().min(1),
});

export const getNotesSchema = z.object({
  body: z.string().optional(),
  tags: z.string().array().optional(),

  pageIndex: z.number(),
  pageSize: z.number(),
  orderBy: z.enum(['createdAt', 'updatedAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export type CreateNoteDTO = z.infer<typeof createNoteSchema>;
export type UpdateNoteDTO = z.infer<typeof updateNoteSchema>;
export type GetNotesDTO = z.infer<typeof getNotesSchema>;

export type Note = Awaited<ReturnType<typeof getNotes>>['notes'][number];
