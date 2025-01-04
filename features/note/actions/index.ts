"use server";

import { type Prisma } from "@prisma/client";

import { ERROR_NO_PERMISSION, PUBLISHED_MAP } from "@/constants";
import { noPermission } from "@/features/user";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

import {
  type CreateNoteDTO,
  type GetNotesDTO,
  type UpdateNoteDTO,
  createNoteSchema,
  getNotesSchema,
  updateNoteSchema,
} from "../types";

export const isNoteExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.note.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getNotes = async (params: GetNotesDTO) => {
  const result = await getNotesSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors.join(";");
    throw new Error(error);
  }

  const cond: Prisma.NoteWhereInput = {};
  if (result.data.published) {
    cond.published = PUBLISHED_MAP[result.data.published];
  }
  if (result.data.body?.trim()) {
    cond.body = { contains: result.data.body.trim() };
  }
  if (result.data.tags?.length) {
    cond.tags = { some: { id: { in: result.data.tags } } };
  }

  const sort = result.data.orderBy
    ? {
        [result.data.orderBy]: result.data.order,
      }
    : undefined;

  const total = await prisma.note.count({ where: cond });
  const notes = await prisma.note.findMany({
    include: {
      tags: true,
    },
    orderBy: sort,
    where: cond,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return { notes, total };
};

export const getAllNotes = async () => {
  const total = await prisma.note.count({});
  const notes = await prisma.note.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: true,
    },
  });

  return { notes, total };
};

export const getNoteByID = async (id: string) => {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  return { note };
};

export const deleteNoteByID = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const isExist = await isNoteExistByID(id);

  if (!isExist) {
    throw new Error("Note不存在");
  }

  await prisma.note.delete({
    where: {
      id,
    },
  });
};

export const createNote = async (params: CreateNoteDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const { body, published, tags } = await createNoteSchema.parseAsync(params);

  await prisma.note.create({
    data: {
      body,
      published,
      tags: {
        connect: tags?.map((tagID) => ({ id: tagID })) ?? [],
      },
    },
  });
};

export const toggleNotePublished = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const note = await prisma.note.findUnique({
    where: {
      id,
    },
  });

  if (!note) {
    throw new Error("笔记不存在");
  }

  await prisma.note.update({
    data: {
      published: !note.published,
    },
    where: {
      id,
    },
  });
};

export const updateNote = async (params: UpdateNoteDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const result = await updateNoteSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors.join(";");
    throw new Error(error);
  }

  const { id, body, published, tags } = result.data;

  const note = await prisma.note.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!note) {
    throw new Error("Note不存在");
  }

  const noteTagIDs = note.tags.map(({ id }) => id);
  const connectTags = tags
    ?.filter((tagID) => !noteTagIDs.includes(tagID))
    .map((id) => ({ id }));
  const disconnectTags = note.tags
    .filter(({ id }) => !tags?.includes(id))
    .map(({ id }) => ({ id }));

  await prisma.note.update({
    where: { id },
    data: {
      body,
      published,
      tags: {
        connect: connectTags?.length ? connectTags : undefined,
        disconnect: disconnectTags.length ? disconnectTags : undefined,
      },
    },
  });
};
