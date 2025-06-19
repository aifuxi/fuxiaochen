"use server";

import { signIn, signOut } from "@/lib/auth";

import { INTERNAL_PATHS } from "@/constants/path";

export async function signInWithGithub() {
  await signIn("github", { redirectTo: INTERNAL_PATHS.DASHBOARD });
}

export async function signOutWithGithub() {
  await signOut({ redirectTo: INTERNAL_PATHS.DASHBOARD_SIGN_IN });
}
