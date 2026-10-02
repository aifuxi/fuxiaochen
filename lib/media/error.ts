export class MediaError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "INVALID_INPUT"
      | "UPLOAD_EXPIRED"
      | "PROCESSING"
      | "RATE_LIMITED"
      | "STORAGE_UNAVAILABLE"
      | "STORAGE_NOT_CONFIGURED",
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
