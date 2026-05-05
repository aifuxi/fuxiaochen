import { logger } from "@/lib/server/logger";

import { enqueueApiTimingLog } from "./api-logs/service";
import { normalizeError, toErrorResponse } from "./http/error-handler";

export type ApiTimingScope = "admin" | "public" | "auth" | "other";
export type ApiTimingStage = "auth" | "parse" | "service" | "response";

type SessionLike = {
  user?: {
    id?: unknown;
    role?: unknown;
  };
} | null;

type ApiTimingDurations = Record<ApiTimingStage, number>;

type ApiTimingContextOptions = {
  operation: string;
  request?: Request;
  scope?: ApiTimingScope;
};

type WithApiTimingOptions = {
  onError?: (error: unknown) => Response;
  scope?: ApiTimingScope;
};

const REQUEST_ID_HEADER = "x-request-id";

const createEmptyDurations = (): ApiTimingDurations => ({
  auth: 0,
  parse: 0,
  service: 0,
  response: 0,
});

const roundMs = (value: number) => Math.round(value * 10) / 10;

const isTimingEnabled = () => process.env.API_TIMING_LOGS === "true";

const getRequestPath = (request?: Request) => {
  if (!request) {
    return "unknown";
  }

  return new URL(request.url).pathname;
};

const getRequestMethod = (request?: Request) => request?.method ?? "UNKNOWN";

export const getApiTimingScope = (pathname: string): ApiTimingScope => {
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    return "admin";
  }

  if (pathname === "/api/public" || pathname.startsWith("/api/public/")) {
    return "public";
  }

  if (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) {
    return "auth";
  }

  return "other";
};

export const getOrCreateRequestId = (headers?: Headers) =>
  headers?.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();

const getSessionLogFields = (session?: SessionLike) => {
  const userId = session?.user?.id;
  const role = session?.user?.role;

  return {
    ...(typeof userId === "string" && userId.length > 0 ? { userId } : {}),
    ...(typeof role === "string" && role.length > 0 ? { role } : {}),
  };
};

const setRequestIdHeader = (response: Response, requestId: string) => {
  try {
    response.headers.set(REQUEST_ID_HEADER, requestId);
  } catch {
    // Some third-party responses may expose immutable headers. Timing logs are
    // still useful even if the correlation header cannot be attached.
  }

  return response;
};

export class ApiTimingContext {
  readonly method: string;
  readonly operation: string;
  readonly path: string;
  readonly requestId: string;
  readonly scope: ApiTimingScope;

  private readonly durations = createEmptyDurations();
  private readonly startedAt = performance.now();
  private logged = false;
  private session?: SessionLike;

  constructor({ operation, request, scope }: ApiTimingContextOptions) {
    this.method = getRequestMethod(request);
    this.operation = operation;
    this.path = getRequestPath(request);
    this.requestId = getOrCreateRequestId(request?.headers);
    this.scope = scope ?? getApiTimingScope(this.path);
  }

  setSession(session: SessionLike) {
    this.session = session;
    return session;
  }

  async time<T>(stage: ApiTimingStage, task: () => Promise<T>): Promise<T> {
    const stageStartedAt = performance.now();

    try {
      return await task();
    } finally {
      this.durations[stage] += performance.now() - stageStartedAt;
    }
  }

  timeSync<T>(stage: ApiTimingStage, task: () => T): T {
    const stageStartedAt = performance.now();

    try {
      return task();
    } finally {
      this.durations[stage] += performance.now() - stageStartedAt;
    }
  }

  complete(response: Response, error?: unknown) {
    setRequestIdHeader(response, this.requestId);
    this.log(response.status, error);

    return response;
  }

  private log(status: number, error?: unknown) {
    if (this.logged) {
      return;
    }

    this.logged = true;

    const normalizedError = error ? normalizeError(error) : undefined;
    const logPayload = {
      event: "api_timing",
      requestId: this.requestId,
      scope: this.scope,
      operation: this.operation,
      method: this.method,
      path: this.path,
      status,
      authMs: roundMs(this.durations.auth),
      parseMs: roundMs(this.durations.parse),
      serviceMs: roundMs(this.durations.service),
      responseMs: roundMs(this.durations.response),
      totalMs: roundMs(performance.now() - this.startedAt),
      ...getSessionLogFields(this.session),
      ...(normalizedError ? { errorCode: normalizedError.code } : {}),
    } as const;

    if (isTimingEnabled()) {
      logger.info(logPayload);
    }

    enqueueApiTimingLog(logPayload);
  }
}

export const createApiTimingContext = (options: ApiTimingContextOptions) =>
  new ApiTimingContext(options);

export async function withApiTiming(
  request: Request | undefined,
  operation: string,
  handler: (timing: ApiTimingContext) => Promise<Response>,
  options: WithApiTimingOptions = {},
) {
  const timing = createApiTimingContext({
    operation,
    request,
    scope: options.scope,
  });

  try {
    const response = await handler(timing);
    return timing.complete(response);
  } catch (error) {
    const response = timing.timeSync(
      "response",
      () => options.onError?.(error) ?? toErrorResponse(error),
    );

    return timing.complete(response, error);
  }
}

export const logApiProxyTiming = ({
  authenticated,
  method,
  path,
  proxyAuthMs,
  requestId,
  status,
}: {
  authenticated: boolean;
  method: string;
  path: string;
  proxyAuthMs: number;
  requestId: string;
  status: number;
}) => {
  const logPayload = {
    event: "api_proxy_timing",
    requestId,
    scope: "admin",
    method,
    path,
    status,
    authenticated,
    proxyAuthMs: roundMs(proxyAuthMs),
  } as const;

  if (isTimingEnabled()) {
    logger.info(logPayload);
  }

  enqueueApiTimingLog(logPayload);
};
