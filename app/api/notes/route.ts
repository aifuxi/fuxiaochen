import { type Prisma } from "@prisma/client";
import { isUndefined } from "es-toolkit";
import { z } from "zod";

import { ERROR_MESSAGE_MAP, PUBLISHED_MAP } from "@/constants";
import { createNoteSchema, getNotesSchema } from "@/features/note";
import { noAdminPermission } from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  const result = await getNotesSchema.safeParseAsync(query);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const cond: Prisma.NoteWhereInput = {};
  if (result.data.body?.trim()) {
    cond.body = { contains: result.data.body.trim() };
  }

  if (result.data.tags?.length) {
    cond.tags = { some: { id: { in: result.data.tags } } };
  }
  if ((await noAdminPermission()) || !isUndefined(result.data.published)) {
    const searchPublished = PUBLISHED_MAP[result.data.published!];
    if (!isUndefined(searchPublished)) {
      cond.published = searchPublished;
    }
  }

  const sort: Prisma.NoteOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    sort[result.data.orderBy] = result.data.order;
  }

  const total = await prisma.note.count({ where: cond });
  const notes = await prisma.note.findMany({
    include: { tags: true },
    where: cond,
    orderBy: sort,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return createResponse({ data: { notes, total } });
}

export async function POST(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const params = await request.json();
  const result = await createNoteSchema.safeParseAsync(params);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const data = await prisma.note.create({
    data: {
      ...result.data,
      tags: {
        connect: result.data.tags?.map((tagID) => ({ id: tagID })) ?? [],
      },
    },
  });

  return createResponse({ data });
}
