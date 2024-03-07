'use server';

import { signIn, signOut } from '@/libs/auth';

import { PATHS } from '@/constants/path';

export const loginWithGithub = async () => {
  await signIn('github', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};

export const logout = async () => {
  await signOut({
    redirectTo: PATHS.AUTH_SIGNIN,
  });
};
