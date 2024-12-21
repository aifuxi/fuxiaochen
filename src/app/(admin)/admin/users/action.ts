"use server";

import { type Prisma } from "@prisma/client";

import { getSkip } from "@/utils/pagination";

import { db } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import {
  createUserByValues,
  deleteUserById,
  getUserByEmail,
  getUserById,
  getUserByName,
  updateUserBannedByValues,
  updateUserByValues,
} from "@/services/user";

import {
  type CreateUserRequestType,
  type GetUsersRequestType,
  type UpdateUserBannedRequestType,
  type UpdateUserRequestType,
  createUserSchema,
  getUsersSchema,
  updateUserSchema,
} from "./schema";

export async function getUsers(data: GetUsersRequestType) {
  try {
    const { page, pageSize, name, email } =
      await getUsersSchema.parseAsync(data);
    const where: Prisma.UserWhereInput = {};

    if (name?.trim()) {
      where.name = {
        contains: name?.trim() ?? "",
      };
    }

    if (email?.trim()) {
      where.email = email?.trim();
    }

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

export async function deleteUser(id: number) {
  try {
    const user = await getUserById(id);

    if (!user) {
      return createErrorResponse("用户不存在");
    }
    const deleteUser = await deleteUserById(user.id);
    return createSuccessResponse({ user: deleteUser });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createUser(data: CreateUserRequestType) {
  try {
    const { email, password, name, role } =
      await createUserSchema.parseAsync(data);

    const userByEmail = await getUserByEmail(email);

    if (userByEmail) {
      throw new Error("邮箱已注册");
    }

    const userByName = await getUserByName(name);

    if (userByName) {
      throw new Error("昵称已存在");
    }

    const user = await createUserByValues({
      email,
      name,
      role,
      password,
    });

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function updateUser(data: UpdateUserRequestType) {
  try {
    const { email, name, role } = await updateUserSchema.parseAsync(data);

    const userByEmail = await getUserByEmail(email);

    if (!userByEmail) {
      throw new Error("用户不存在");
    }

    const userByName = await getUserByName(name);

    if (userByName && userByName.email !== email) {
      throw new Error("昵称已存在");
    }

    const user = await updateUserByValues({
      email,
      name,
      role,
    });

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function updateUserBanned(data: UpdateUserBannedRequestType) {
  try {
    const { id, banned } = data;

    const userById = await getUserById(id);

    if (!userById) {
      throw new Error("用户不存在");
    }

    const user = await updateUserBannedByValues({
      id,
      banned,
    });

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function getUser(email: string) {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return createErrorResponse("用户不存在");
    }
    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}
