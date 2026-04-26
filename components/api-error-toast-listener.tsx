"use client";

import { useEffect } from "react";

import { toast } from "sonner";

import { clientEvents, type ApiErrorEvent } from "@/lib/client/events";

export function ApiErrorToastListener() {
  useEffect(() => {
    const handleApiError = (event: ApiErrorEvent) => {
      toast.error(event.message);
    };

    clientEvents.on("api:error", handleApiError);

    return () => {
      clientEvents.off("api:error", handleApiError);
    };
  }, []);

  return null;
}
