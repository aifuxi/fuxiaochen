"use server";

import { hashSync } from "bcryptjs";

import { type RegisterRequest, registerSchema } from "@/features/auth";
import { prisma } from "@/lib/prisma";

export const createUser = async (params: RegisterRequest) => {
  const result = await registerSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors.join(";");
    // TODO: 记录日志
    throw new Error(error);
  }

  const isExist = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  if (isExist) {
    throw new Error("当前邮箱已注册！");
  }

  const hashedPassword = hashSync(result.data.password);
  await prisma.user.create({
    data: {
      name: result.data.name,
      password: hashedPassword,
      email: result.data.email,
    },
  });
};

// TODO: 移除此函数
export const noPermission = async () => {
  return false;
};
