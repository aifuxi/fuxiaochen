import { ZodError } from "zod";

import { apiErrorCodes, errorStatusMap, type ErrorCode } from "@/lib/api/error-codes";

type ApiErrorOptions = {
  code: ErrorCode;
  details?: Record<string, unknown>;
  message: string;
  status?: number;
};

export class ApiError extends Error {
  code: ErrorCode;
  details: Record<string, unknown>;
  status: number;

  constructor({ code, details, message, status }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details ?? {};
    this.status = status ?? errorStatusMap[code];
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function normalizeApiError(error: unknown) {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiError({
      code: apiErrorCodes.VALIDATION_ERROR,
      details: {
        issues: error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
      },
      message: "Request validation failed.",
    });
  }

  if (error instanceof SyntaxError) {
    return new ApiError({
      code: apiErrorCodes.VALIDATION_ERROR,
      message: "Request body must be valid JSON.",
    });
  }

  return new ApiError({
    code: apiErrorCodes.INTERNAL_ERROR,
    message: "Internal server error.",
  });
}
