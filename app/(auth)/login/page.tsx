import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { requireGuestSession } from "@/lib/auth-session";
import { isGithubOAuthConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "登录",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = getSafeRedirectPath(next);

  await requireGuestSession(redirectTo);

  return (
    <AuthForm
      mode="login"
      redirectTo={redirectTo}
      githubEnabled={isGithubOAuthConfigured()}
    />
  );
}
