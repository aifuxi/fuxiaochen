"use server";

import { PATHS } from "@/constants";
import { signOut } from "@/lib/auth";

export const signOutAndRedirect = async () => {
  await signOut({
    redirectTo: PATHS.AUTH_SIGN_IN,
  });
};
