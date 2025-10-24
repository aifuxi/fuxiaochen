"use server";

import { z } from "zod";

import { hasAdminUser } from "@/app/actions";

import { ERROR_MESSAGE_MAP, ROLES, ROLE_LABEL_MAP } from "@/constants";
import { auth } from "@/lib/auth";
import { createResp } from "@/lib/common";
import { prisma } from "@/lib/prisma";

const signUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpWithEmail(values: z.infer<typeof signUpSchema>) {
  const validatedFields = signUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return createResp({ error: ERROR_MESSAGE_MAP.paramsError });
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return createResp({ error: ERROR_MESSAGE_MAP.signUpEmailExists });
  }

  const adminUserExist = await hasAdminUser();
  // 无管理员时，第一个注册用户为管理员
  const role = adminUserExist ? ROLES.visitor : ROLES.admin;

  try {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (response.user.id) {
      await prisma.user.update({
        where: { id: response.user.id },
        data: { role },
      });
    }

    return createResp({
      message: `${ERROR_MESSAGE_MAP.signUpSuccess} 你当前的角色为【${ROLE_LABEL_MAP[role]}】`,
    });
  } catch (error: any) {
    return createResp({
      error: error?.message ?? ERROR_MESSAGE_MAP.serverError,
    });
  }
}
