'use server';

import { hashSync } from 'bcryptjs';

import { db } from '@/libs/prisma';
import { type CreateUserReq } from '@/typings/user';

export async function createUser(params: CreateUserReq) {
  const hashedPassword = hashSync(params.password);
  const user = await db.user.create({
    data: {
      name: params.name,
      password: hashedPassword,
      email: params.email,
    },
  });

  return user;
}
