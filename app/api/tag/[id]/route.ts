import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { updateTagSchema } from "@/features/tag";
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

  const tag = await prisma.tag.findUnique({
    where: {
      id,
    },
  });

  if (!tag) {
    return createResponse({ error: ERROR_MESSAGE_MAP.tagNotExist });
  }

  return createResponse({ data: tag });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const tag = await prisma.tag.findUnique({
    where: {
      id,
    },
  });

  if (!tag) {
    return createResponse({ error: ERROR_MESSAGE_MAP.tagNotExist });
  }

  const body = await request.json();

  const result = await updateTagSchema.safeParseAsync(body);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const { id: _, ...data } = result.data;

  const newTag = await prisma.tag.update({
    where: {
      id,
    },
    data,
  });

  return createResponse({ data: newTag });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const tag = await prisma.tag.findUnique({
    where: {
      id,
    },
  });

  if (!tag) {
    return createResponse({ error: ERROR_MESSAGE_MAP.tagNotExist });
  }

  await prisma.tag.delete({
    where: {
      id,
    },
  });

  return createResponse({ data: null });
}
