"use client";

import { useEffect } from "react";

import { ErrorView } from "@/components/cyberpunk/error-view";

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
      title="系统故障"
      message="神经连接中断"
      onRetry={() => reset()}
    />
  );
}
