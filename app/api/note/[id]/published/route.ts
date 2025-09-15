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

  const note = await prisma.note.findUnique({
    where: {
      id,
    },
  });

  if (!note) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noteNotExist });
  }

  const newNote = await prisma.note.update({
    where: { id },
    data: {
      published: !note.published,
    },
  });

  return createResponse({ data: newNote });
}
