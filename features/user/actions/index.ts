"use server";

import { ROLES } from "@/constants";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const noAdminPermission = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    return true;
  }

  const user = await getUserByEmail(session?.user?.email);
  return user?.role !== ROLES.admin;
};

export const hasAdminUser = async () => {
  const adminUser = await prisma.user.findFirst({
    where: {
      role: ROLES.admin,
    },
  });

  return Boolean(adminUser);
};
