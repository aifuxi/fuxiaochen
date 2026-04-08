import type { ErrorCode } from "@/lib/api/error-codes";

type SuccessResponseOptions<TMeta> = {
  code?: "OK";
  message: string;
  meta?: TMeta;
  status?: number;
};

type ErrorResponseBody = {
  code: ErrorCode;
  error: {
    details: Record<string, unknown>;
  };
  message: string;
  success: false;
};

type SuccessResponseBody<TData, TMeta> = {
  code: "OK";
  data: TData;
  message: string;
  meta?: TMeta;
  success: true;
};

export function successResponse<TData, TMeta = never>(
  data: TData,
  options: SuccessResponseOptions<TMeta>,
) {
  const body: SuccessResponseBody<TData, TMeta> = {
    code: options.code ?? "OK",
    data,
    message: options.message,
    success: true,
  };

  if (options.meta !== undefined) {
    body.meta = options.meta;
  }

  return Response.json(body, {
    status: options.status ?? 200,
  });
}

export function errorResponse(error: {
  code: ErrorCode;
  details: Record<string, unknown>;
  message: string;
  status: number;
}) {
  const body: ErrorResponseBody = {
    code: error.code,
    error: {
      details: error.details,
    },
    message: error.message,
    success: false,
  };

  return Response.json(body, {
    status: error.status,
  });
}
