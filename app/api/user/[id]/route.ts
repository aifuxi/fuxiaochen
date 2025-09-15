import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { noAdminPermission, updateUserSchema } from "@/features/user";
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

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    return createResponse({ error: ERROR_MESSAGE_MAP.userNotExist });
  }

  return createResponse({ data: user });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    return createResponse({ error: ERROR_MESSAGE_MAP.userNotExist });
  }

  const body = await request.json();

  const result = await updateUserSchema.safeParseAsync(body);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const newUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name: result.data.name,
      role: result.data.role,
    },
  });

  return createResponse({ data: newUser });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    return createResponse({ error: ERROR_MESSAGE_MAP.userNotExist });
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });

  return createResponse({ data: null });
}
