'use server';

import { hashSync } from 'bcryptjs';

import { type CreateUserReq } from '@/typings/user';

import { prisma } from '@/libs/prisma';

export async function createUser(params: CreateUserReq) {
  const hashedPassword = hashSync(params.password);
  const user = await prisma.user.create({
    data: {
      name: params.name,
      password: hashedPassword,
      email: params.email,
    },
  });

  return user;
}
