import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { updateSnippetSchema } from "@/features/snippet";
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

  const snippet = await prisma.snippet.findUnique({
    where: {
      id,
    },
    include: {
      tags: true,
    },
  });

  if (!snippet) {
    return createResponse({ error: ERROR_MESSAGE_MAP.snippetNotExist });
  }

  return createResponse({ data: snippet });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const snippet = await prisma.snippet.findUnique({
    where: {
      id,
    },
  });

  if (!snippet) {
    return createResponse({ error: ERROR_MESSAGE_MAP.snippetNotExist });
  }

  const body = await request.json();

  const result = await updateSnippetSchema.safeParseAsync(body);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const newSnippet = await prisma.snippet.update({
    where: { id: result.data.id },
    data: {
      title: result.data.title,
      description: result.data.description,
      slug: result.data.slug,
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

  return createResponse({ data: newSnippet });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const snippet = await prisma.snippet.findUnique({
    where: {
      id,
    },
  });

  if (!snippet) {
    return createResponse({ error: ERROR_MESSAGE_MAP.snippetNotExist });
  }

  await prisma.snippet.delete({
    where: {
      id,
    },
  });

  return createResponse({ data: null });
}
