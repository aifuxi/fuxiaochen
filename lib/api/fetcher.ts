import { emitApiError } from "@/lib/client/events";

export type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiSuccessPayload<
  TData,
  TMeta = undefined,
> = TMeta extends undefined
  ? {
      success: true;
      data: TData;
    }
  : {
      success: true;
      data: TData;
      meta: TMeta;
    };

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor({
    status,
    message,
    code,
    details,
  }: {
    status: number;
    message: string;
    code?: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export type ApiRequestInit = RequestInit & {
  errorFallback?: string;
  errorSource?: string;
  toastOnError?: boolean;
};

const isAdminApiPath = (pathname: string) =>
  pathname === "/api/admin" || pathname.startsWith("/api/admin/");

const isAdminApiRequest = (input: RequestInfo | URL) => {
  if (typeof input === "string") {
    try {
      return isAdminApiPath(new URL(input, "http://local").pathname);
    } catch {
      return false;
    }
  }

  if (input instanceof URL) {
    return isAdminApiPath(input.pathname);
  }

  return isAdminApiPath(new URL(input.url).pathname);
};

export async function apiRequest<TData, TMeta = undefined>(
  input: RequestInfo | URL,
  init?: ApiRequestInit,
) {
  const {
    errorFallback = "Request failed",
    errorSource,
    toastOnError = true,
    ...requestInit
  } = init ?? {};
  const response = await fetch(input, {
    ...requestInit,
    cache:
      requestInit.cache ?? (isAdminApiRequest(input) ? "no-store" : undefined),
  });
  const payload = (await response.json()) as
    | ApiSuccessPayload<TData, TMeta>
    | ApiErrorPayload;

  if (!response.ok || payload.success === false) {
    const error = new ApiRequestError({
      status: response.status,
      message:
        payload.success === false
          ? payload.error.message
          : `Request failed with status ${response.status}`,
      code: payload.success === false ? payload.error.code : undefined,
      details: payload.success === false ? payload.error.details : undefined,
    });

    if (toastOnError) {
      emitApiError(error, errorFallback, errorSource);
    }

    throw error;
  }

  return payload;
}

export async function fetchApiData<TData>(
  input: RequestInfo | URL,
  init?: ApiRequestInit,
) {
  const payload = await apiRequest<TData>(input, init);
  return payload.data;
}

export function buildApiUrl(
  pathname: string,
  searchParams?: Record<string, string | number | boolean | null | undefined>,
) {
  const url = new URL(pathname, "http://local");

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return `${url.pathname}${url.search}`;
}
