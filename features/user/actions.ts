"use server";

import { User } from "@prisma/client";

import { hashPassword } from "@/lib/crypt";
import { prisma } from "@/lib/prisma";

import { RegisterRequest } from "../auth";

interface GetUserOption {
  withPassword?: boolean;
}

interface UserInfo {
  id: string;
  nickname: string;
  role: string;
  email: string;
  password?: string;
}

function getUserInfo(user: User, options?: GetUserOption): UserInfo {
  const { withPassword = false } = options ?? {};

  return {
    id: user.id,
    nickname: user.nickname,
    role: user.role,
    email: user.email,
    password: withPassword ? user.password : undefined,
  };
}

export async function getUserByEmail(email: string, options?: GetUserOption) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  const resp = getUserInfo(user, options);

  return resp;
}

export async function getUserById(id: string, options?: GetUserOption) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return null;
  }

  const resp = getUserInfo(user, options);

  return resp;
}

export async function createUser(
  data: RegisterRequest,
  options?: GetUserOption,
) {
  const existedUser = await getUserByEmail(data.email);

  if (existedUser?.id) {
    return null;
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      nickname: data.nickname,
      password: hashPassword(data.password),
      role: "test",
    },
  });

  if (!user) {
    return null;
  }

  const resp = getUserInfo(user, options);

  return resp;
}
