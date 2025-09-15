import { type Prisma } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import {
  createUserSchema,
  getUsersSchema,
  noAdminPermission,
} from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

export async function GET(request: Request) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const url = new URL(request.url);
  let query = Object.fromEntries(url.searchParams);
  const result = await getUsersSchema.safeParseAsync(query);

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

  const sort = result.data.orderBy
    ? {
        [result.data.orderBy]: result.data.order,
      }
    : undefined;

  const total = await prisma.user.count({ where: cond });
  const users = await prisma.user.findMany({
    orderBy: sort,
    where: cond,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
    omit: {
      password: true,
    },
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

  const hashedPassword = hashSync(result.data.password);
  const user = await prisma.user.create({
    data: {
      name: result.data.name,
      password: hashedPassword,
      email: result.data.email,
      role: result.data.role,
    },
    omit: {
      password: true,
    },
  });

  return createResponse({
    data: user,
  });
}
