import mitt from "mitt";

export type ApiErrorEvent = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
  source?: string;
};

type ClientEvents = {
  "api:error": ApiErrorEvent;
};

export const clientEvents = mitt<ClientEvents>();

const isErrorWithApiFields = (
  error: unknown,
): error is Error & {
  code?: string;
  details?: unknown;
  status?: number;
} => error instanceof Error;

export function emitApiError(
  error: unknown,
  fallback: string,
  source?: string,
) {
  if (isErrorWithApiFields(error)) {
    clientEvents.emit("api:error", {
      code: error.code,
      details: error.details,
      message: error.message || fallback,
      source,
      status: error.status,
    });
    return;
  }

  clientEvents.emit("api:error", {
    message: fallback,
    source,
  });
}
