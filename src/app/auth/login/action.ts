"use server";

import { comparePassword } from "@/lib/bcrypt";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import { getUserByEmail } from "@/services/user";

import { type LoginRequestType, loginSchema } from "./schema";

export async function login(data: LoginRequestType) {
  try {
    const { email, password } = await loginSchema.parseAsync(data);

    const userByEmail = await getUserByEmail(email, { withPassword: true });

    if (!userByEmail) {
      throw new Error("邮箱或密码错误");
    }

    const isCorrectPassword = await comparePassword(
      password,
      userByEmail.password,
    );

    if (!isCorrectPassword) {
      throw new Error("邮箱或密码错误");
    }

    return createSuccessResponse(null);
  } catch (error) {
    return createErrorResponse(error);
  }
}
