'use server';

import { AuthError } from 'next-auth';

import { PATHS } from '@/config';

import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { type SigninDTO, signinSchema } from '../types';

export const signinWithGithub = async () => {
  await signIn('github', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};

export const signinWithCredentials = async (params: SigninDTO) => {
  const result = await signinSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const isExist = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  if (!isExist) {
    // TODO: 记录日志
    throw new Error('邮箱或密码错误');
  }

  try {
    await signIn('credentials', {
      ...result.data,
      redirectTo: PATHS.ADMIN_HOME,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // TODO: 记录日志
      throw new Error('邮箱或密码错误');
    }

    throw error;
  }
};
