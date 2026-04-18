import type { ErrorCode } from "./error-codes";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);

    this.code = code;
    this.status = status;
    this.details = details;
    this.name = "AppError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
