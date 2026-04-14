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
      title="页面发生异常"
      message="出现了一个未预期的问题，我们已经帮你保留当前位置。"
      onRetry={() => reset()}
    />
  );
}
