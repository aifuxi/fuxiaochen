import { AuthForm } from "@/components/auth/auth-form";

import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { requireGuestSession } from "@/lib/auth-session";

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
      githubEnabled={
        Boolean(process.env.GITHUB_CLIENT_ID) &&
        Boolean(process.env.GITHUB_CLIENT_SECRET)
      }
    />
  );
}
