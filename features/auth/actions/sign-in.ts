'use server';

import { PATHS } from '@/constants';
import { signIn } from '@/lib/auth';

export const signInWithGithub = async () => {
  await signIn('github', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};

export const signInWithGoogle = async () => {
  await signIn('google', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};
