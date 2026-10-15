export class MediaError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "INVALID_INPUT"
      | "RATE_LIMITED"
      | "STORAGE_UNAVAILABLE"
      | "STORAGE_NOT_CONFIGURED",
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
