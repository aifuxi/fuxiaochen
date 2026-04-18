import type { AppError } from "./errors";

type ResponseMeta = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizeJsonValue = (
  value: unknown,
  seen: WeakSet<object> = new WeakSet(),
): unknown => {
  if (value === null) {
    return null;
  }

  const valueType = typeof value;

  if (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean"
  ) {
    return value;
  }

  if (valueType === "bigint") {
    return BigInt.prototype.toString.call(value);
  }

  if (valueType === "undefined" || valueType === "function") {
    return undefined;
  }

  if (valueType === "symbol") {
    return Symbol.prototype.toString.call(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    const sanitizedArray = value.map((item) => {
      const sanitizedItem = sanitizeJsonValue(item, seen);
      return sanitizedItem === undefined ? null : sanitizedItem;
    });

    seen.delete(value);

    return sanitizedArray;
  }

  if (isRecord(value)) {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    const entries = Object.entries(value).flatMap(([key, entryValue]) => {
      const sanitizedEntry = sanitizeJsonValue(entryValue, seen);

      return sanitizedEntry === undefined ? [] : [[key, sanitizedEntry]];
    });

    seen.delete(value);

    return Object.fromEntries(entries);
  }

  return Object.prototype.toString.call(value);
};

export function createSuccessResponse<TData>(
  data: TData,
  meta?: ResponseMeta,
  status = 200,
) {
  const sanitizedData = sanitizeJsonValue(data);
  const sanitizedMeta =
    meta === undefined ? undefined : sanitizeJsonValue(meta);

  return Response.json(
    sanitizedMeta === undefined
      ? { success: true, data: sanitizedData }
      : { success: true, data: sanitizedData, meta: sanitizedMeta },
    { status },
  );
}

export function createErrorResponse(error: AppError) {
  const details = sanitizeJsonValue(error.details);

  return Response.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status: error.status },
  );
}
