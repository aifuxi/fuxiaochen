'use server';

import { hashSync } from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { type CreateUserReq } from '@/types/user';

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
