"use server";

import { Role } from "@prisma/client";

import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import {
  createUserByValues,
  getFirstAdminUser,
  getUserByEmail,
  getUserByName,
} from "@/services/user";

import { type RegisterRequestType, registerSchema } from "./schema";

export async function register(data: RegisterRequestType) {
  try {
    const { email, password, name } = await registerSchema.parseAsync(data);

    const userByEmail = await getUserByEmail(email);

    if (userByEmail) {
      throw new Error("邮箱已注册");
    }

    const userByName = await getUserByName(name);

    if (userByName) {
      throw new Error("昵称已存在");
    }

    const adminUser = await getFirstAdminUser();
    let role: Role = Role.USER;
    // 不存在管理员用户时，注册当前用户为管理员
    if (!adminUser) {
      role = Role.ADMIN;
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

export async function checkAdminUserExist() {
  try {
    const adminUser = await getFirstAdminUser();
    return createSuccessResponse(Boolean(adminUser));
  } catch (error) {
    return createErrorResponse(error);
  }
}
