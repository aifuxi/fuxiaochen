import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { updateNoteSchema } from "@/features/note";
import { noAdminPermission } from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: {
      id,
    },
    include: {
      tags: true,
    },
  });

  if (!note) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noteNotExist });
  }

  return createResponse({ data: note });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: {
      id,
    },
  });

  if (!note) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noteNotExist });
  }

  const body = await request.json();

  const result = await updateNoteSchema.safeParseAsync(body);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const newNote = await prisma.note.update({
    where: { id: result.data.id },
    data: {
      body: result.data.body,
      published: result.data.published,
      tags: {
        set: result.data.tags?.map((el) => {
          return { id: el };
        }),
      },
    },
    include: { tags: true },
  });

  return createResponse({ data: newNote });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: {
      id,
    },
  });

  if (!note) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noteNotExist });
  }

  await prisma.note.delete({
    where: {
      id,
    },
  });

  return createResponse({ data: null });
}
