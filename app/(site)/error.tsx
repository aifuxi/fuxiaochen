"use client";

import { SiteErrorStatus } from "@/components/site/site-error-status";

export default function SiteError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SiteErrorStatus reset={reset} />;
}
