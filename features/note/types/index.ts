import { z } from "zod";

import { type BaseResponse, type DbNote, type DbTag } from "@/types";

import { PUBLISHED_ENUM } from "@/constants";

export const createNoteSchema = z.object({
  body: z.string().min(1, { message: "长度不能少于1个字符" }),
  published: z.boolean().optional(),
  tags: z.string().array().optional(),
});

export const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string().min(1),
});

export const getNotesSchema = z.object({
  body: z.string().optional(),
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

export type CreateNoteRequest = z.infer<typeof createNoteSchema>;
export type UpdateNoteRequest = z.infer<typeof updateNoteSchema>;
export type GetNotesRequest = z.infer<typeof getNotesSchema>;

export type Note = DbNote & {
  tags: DbTag[];
};

export type GetNotesData = {
  notes: Note[];
  total: number;
};

export type GetNotesResponse = BaseResponse<GetNotesData>;

export type GetNoteData = Note;

export type CreateNoteData = Note;

export type CreateNoteResponse = BaseResponse<Note>;

export type UpdateNoteData = Note;

export type UpdateNoteResponse = BaseResponse<UpdateNoteData>;
