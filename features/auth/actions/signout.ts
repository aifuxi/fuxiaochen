'use server';

import { PATHS } from '@/config';

import { signOut } from '@/lib/auth';

export const signoutAndRedirect = async () => {
  await signOut({
    redirectTo: PATHS.AUTH_SIGNIN,
  });
};
