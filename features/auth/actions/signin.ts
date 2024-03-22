'use server';

import { PATHS } from '@/constants';
import { signIn } from '@/lib/auth';

export const signinWithGithub = async () => {
  await signIn('github', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};

export const signinWithGoogle = async () => {
  await signIn('google', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};
