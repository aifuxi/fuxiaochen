'use server';

import { hashSync } from 'bcryptjs';

import { type ErrorResponse } from '@/types';

import { type SignupDTO, signupSchema } from '@/features/auth';
import { prisma } from '@/lib/prisma';

export const createUser = async (
  params: SignupDTO,
): Promise<ErrorResponse | undefined> => {
  const result = await signupSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    return { error };
  }

  const isExist = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  if (isExist) {
    return {
      error: '当前邮箱已存在！',
    };
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
