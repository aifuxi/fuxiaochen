import { z } from "zod";

import { noAdminPermission } from "@/app/actions";

import { createUserSchema, getUsersSchema } from "@/types/user";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { type Prisma } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  const result = await getUsersSchema.safeParseAsync({
    ...query,
    roles: query.roles?.split(",") ?? [],
  });

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const cond: Prisma.UserWhereInput = {};

  if (result.data.email?.trim()) {
    cond.email = { contains: result.data.email.trim() };
  }

  if (result.data.name?.trim()) {
    cond.name = { contains: result.data.name.trim() };
  }

  const validRoles = result.data.roles?.filter(Boolean) ?? [];
  if (validRoles.length) {
    cond.role = {
      in: validRoles,
    };
  }

  const total = await prisma.user.count({ where: cond });
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: cond,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return createResponse({
    data: {
      users,
      total,
    },
  });
}

export async function POST(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const params = await request.json();
  const result = await createUserSchema.safeParseAsync(params);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const isExist = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  if (isExist) {
    return createResponse({ error: ERROR_MESSAGE_MAP.signUpEmailExists });
  }

  await auth.api.signUpEmail({
    body: {
      email: result.data.email,
      password: result.data.password,
      name: result.data.name,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  return createResponse({
    data: user,
  });
}
