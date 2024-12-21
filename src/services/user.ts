"use server";

import { Role } from "@prisma/client";

import {
  type CreateUserRequestType,
  type UpdateUserBannedRequestType,
  type UpdateUserRequestType,
} from "@/app/(admin)/admin/users/schema";

import { hashPassword } from "@/lib/bcrypt";
import { db } from "@/lib/prisma";

export async function getUserByEmail(
  email: string,
  options?: {
    withPassword?: boolean;
  },
) {
  if (!email) {
    return null;
  }

  const { withPassword = false } = options ?? {};

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!withPassword && user) {
    user.password = "";
  }

  return user;
}

export async function getUserById(
  id: number,
  options?: {
    withPassword?: boolean;
  },
) {
  if (!id) {
    return null;
  }

  const { withPassword = false } = options ?? {};

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!withPassword && user) {
    user.password = "";
  }

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

export async function deleteUserById(id: number) {
  const user = await db.user.delete({ where: { id } });

  return user;
}

export async function createUserByValues(values: CreateUserRequestType) {
  const hashedPassword = await hashPassword(values.password);
  const user = await db.user.create({
    data: {
      email: values.email,
      password: hashedPassword,
      name: values.name,
      role: values.role,
    },
  });

  return user;
}

export async function updateUserByValues(values: UpdateUserRequestType) {
  const user = await db.user.update({
    where: {
      email: values.email,
    },
    data: {
      name: values.name,
      role: values.role,
    },
  });

  return user;
}

export async function updateUserBannedByValues(
  values: UpdateUserBannedRequestType,
) {
  const user = await db.user.update({
    where: {
      id: values.id,
    },
    data: {
      banned: values.banned,
    },
  });

  return user;
}
