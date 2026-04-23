export function getSafeRedirectPath(
  redirectTo: string | string[] | null | undefined,
  fallback = "/admin",
) {
  const value = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
