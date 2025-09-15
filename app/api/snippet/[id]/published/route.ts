import { ERROR_MESSAGE_MAP } from "@/constants";
import { noAdminPermission } from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

  const newSnippet = await prisma.snippet.update({
    where: { id },
    data: {
      published: !snippet.published,
    },
  });

  return createResponse({ data: newSnippet });
}
