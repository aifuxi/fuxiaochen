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

export async function apiRequest<TData, TMeta = undefined>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as
    | ApiSuccessPayload<TData, TMeta>
    | ApiErrorPayload;

  if (!response.ok || payload.success === false) {
    throw new ApiRequestError({
      status: response.status,
      message:
        payload.success === false
          ? payload.error.message
          : `Request failed with status ${response.status}`,
      code: payload.success === false ? payload.error.code : undefined,
      details: payload.success === false ? payload.error.details : undefined,
    });
  }

  return payload;
}

export async function fetchApiData<TData>(
  input: RequestInfo | URL,
  init?: RequestInit,
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
