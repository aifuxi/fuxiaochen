'use server';

import { PATHS } from '@/constants/path';

import { signIn, signOut } from '@/lib/auth';

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
