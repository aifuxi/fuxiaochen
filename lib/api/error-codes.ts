export const apiErrorCodes = {
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export const tagErrorCodes = {
  TAG_NAME_CONFLICT: "TAG_NAME_CONFLICT",
  TAG_NOT_FOUND: "TAG_NOT_FOUND",
  TAG_SLUG_CONFLICT: "TAG_SLUG_CONFLICT",
} as const;

export const categoryErrorCodes = {
  CATEGORY_NAME_CONFLICT: "CATEGORY_NAME_CONFLICT",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  CATEGORY_SLUG_CONFLICT: "CATEGORY_SLUG_CONFLICT",
} as const;

export const errorCodes = {
  ...apiErrorCodes,
  ...categoryErrorCodes,
  ...tagErrorCodes,
} as const;

export type ErrorCode = typeof errorCodes[keyof typeof errorCodes];

export const errorStatusMap: Record<ErrorCode, number> = {
  CATEGORY_NAME_CONFLICT: 409,
  CATEGORY_NOT_FOUND: 404,
  CATEGORY_SLUG_CONFLICT: 409,
  INTERNAL_ERROR: 500,
  TAG_NAME_CONFLICT: 409,
  TAG_NOT_FOUND: 404,
  TAG_SLUG_CONFLICT: 409,
  UNAUTHORIZED: 401,
  VALIDATION_ERROR: 400,
};
