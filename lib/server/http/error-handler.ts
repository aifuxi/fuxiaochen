import { ZodError } from "zod";

import { ERROR_CODES } from "./error-codes";
import { AppError } from "./errors";
import { createErrorResponse } from "./response";

export function normalizeError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    const flattened = error.flatten();

    return new AppError(
      ERROR_CODES.COMMON_VALIDATION_ERROR,
      "Request validation failed",
      400,
      {
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
    );
  }

  return new AppError(
    ERROR_CODES.COMMON_INTERNAL_ERROR,
    "Internal server error",
    500,
  );
}

export function toErrorResponse(error: unknown) {
  return createErrorResponse(normalizeError(error));
}
