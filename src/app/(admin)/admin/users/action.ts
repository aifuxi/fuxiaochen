"use server";

import { type Prisma } from "@prisma/client";

import { getSkip } from "@/utils/pagination";

import { db } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";

import { type GetUsersRequestType, getUsersSchema } from "./schema";

export async function getUsers(data: GetUsersRequestType) {
  try {
    const { page, pageSize, name, email } =
      await getUsersSchema.parseAsync(data);
    const where: Prisma.UserWhereInput = {
      OR: [
        {
          name: {
            contains: name?.trim() ?? "",
          },
        },
        {
          email: {
            contains: email?.trim() ?? "",
          },
        },
      ],
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        take: pageSize,
        skip: getSkip(page, pageSize),
      }),
      db.user.count({
        where,
      }),
    ]);
    return createSuccessResponse({ users, total });
  } catch (error) {
    return createErrorResponse(error);
  }
}
