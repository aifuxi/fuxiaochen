"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/ui/error-view";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <ErrorView
      code="500"
      title="Something went wrong"
      message="We encountered an unexpected error."
      onRetry={() => reset()}
    />
  );
}
