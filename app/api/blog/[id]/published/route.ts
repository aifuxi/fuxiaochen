import { noAdminPermission } from "@/app/actions";

import { ERROR_MESSAGE_MAP } from "@/constants";
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

  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!blog) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogNotExist });
  }

  const newSnippet = await prisma.blog.update({
    where: { id },
    data: {
      published: !blog.published,
    },
  });

  return createResponse({ data: newSnippet });
}
