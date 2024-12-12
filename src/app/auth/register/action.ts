"use server";

import { Role } from "@prisma/client";

import { hashPassword } from "@/lib/bcrypt";
import { db } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import { getUserByEmail, getUserByName } from "@/services/user";

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

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
        role: Role.ADMIN,
      },
    });

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}
