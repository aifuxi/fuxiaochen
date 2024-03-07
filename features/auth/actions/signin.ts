'use server';

import { PATHS } from '@/config';

import { signIn } from '@/lib/auth';

export const signinWithGithub = async () => {
  await signIn('github', {
    redirectTo: PATHS.ADMIN_HOME,
  });
};
