"use server";

import { Role } from "@prisma/client";

import { db } from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  if (!email) {
    return null;
  }

  const user = await db.user.findUnique({ where: { email } });

  return user;
}

export async function getUserByName(name: string) {
  if (!name) {
    return null;
  }

  const user = await db.user.findUnique({ where: { name } });

  return user;
}

export async function getFirstAdminUser() {
  const user = await db.user.findFirst({ where: { role: Role.ADMIN } });

  return user;
}
