import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import {
  normalizeError,
  toErrorResponse,
} from "../../../lib/server/http/error-handler";
import { AppError } from "../../../lib/server/http/errors";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../../lib/server/http/response";

test("createSuccessResponse wraps payloads in the shared envelope", async () => {
  const response = createSuccessResponse({ id: "cat_1" }, { page: 1 });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: { id: "cat_1" },
    meta: { page: 1 },
  });
});

test("createSuccessResponse sanitizes non-JSON-safe data and meta", async () => {
  const data: Record<string, unknown> = {
    id: 1n,
    skip: () => undefined,
  };
  data.self = data;

  const response = createSuccessResponse(data, {
    page: 2n,
    filter: () => undefined,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: {
      id: "1",
      self: "[Circular]",
    },
    meta: {
      page: "2",
    },
  });
});

test("shared sanitizer handles circular arrays for success and error responses", async () => {
  const successArray: unknown[] = ["root"];
  successArray.push(successArray);

  const successResponse = createSuccessResponse({
    items: successArray,
  });

  const errorArray: unknown[] = ["root"];
  errorArray.push(errorArray);

  const errorResponse = createErrorResponse(
    new AppError("CATEGORY_NOT_FOUND", "Category not found", 404, {
      items: errorArray,
    }),
  );

  assert.deepEqual(await successResponse.json(), {
    success: true,
    data: {
      items: ["root", "[Circular]"],
    },
  });

  assert.deepEqual(await errorResponse.json(), {
    success: false,
    error: {
      code: "CATEGORY_NOT_FOUND",
      message: "Category not found",
      details: {
        items: ["root", "[Circular]"],
      },
    },
  });
});

test("createErrorResponse serializes AppError fields into the shared envelope", async () => {
  const response = createErrorResponse(
    new AppError("CATEGORY_NOT_FOUND", "Category not found", 404, {
      id: "cat_missing",
    }),
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: "CATEGORY_NOT_FOUND",
      message: "Category not found",
      details: { id: "cat_missing" },
    },
  });
});

test("createErrorResponse sanitizes non-JSON-safe AppError details", async () => {
  const response = createErrorResponse(
    new AppError("CATEGORY_NOT_FOUND", "Category not found", 404, {
      count: 1n,
    }),
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: "CATEGORY_NOT_FOUND",
      message: "Category not found",
      details: {
        count: "1",
      },
    },
  });
});

test("ERROR_CODES exposes the shared API error vocabulary", () => {
  assert.deepEqual(Object.keys(ERROR_CODES).sort(), [
    "BLOG_CATEGORY_NOT_FOUND",
    "BLOG_NOT_FOUND",
    "BLOG_SLUG_CONFLICT",
    "BLOG_TAGS_NOT_FOUND",
    "CATEGORY_NOT_FOUND",
    "CATEGORY_SLUG_CONFLICT",
    "CHANGELOG_NOT_FOUND",
    "CHANGELOG_VERSION_CONFLICT",
    "COMMON_INTERNAL_ERROR",
    "COMMON_INVALID_REQUEST",
    "COMMON_VALIDATION_ERROR",
    "TAG_NOT_FOUND",
    "TAG_SLUG_CONFLICT",
  ]);
});

test("normalizeError converts ZodError into a validation AppError", () => {
  const schema = z.object({
    title: z.string().min(1),
  });

  const result = schema.safeParse({ title: "" });

  assert.equal(result.success, false);
  const error = normalizeError(result.error);

  assert.ok(error instanceof AppError);
  assert.equal(error.code, ERROR_CODES.COMMON_VALIDATION_ERROR);
  assert.equal(error.message, "Request validation failed");
  assert.equal(error.status, 400);
  assert.deepEqual(error.details, {
    fieldErrors: {
      title: ["Too small: expected string to have >=1 characters"],
    },
    formErrors: [],
  });
});

test("normalizeError preserves root-level Zod form errors", () => {
  const result = z.string().min(1).safeParse("");

  assert.equal(result.success, false);
  const error = normalizeError(result.error);

  assert.ok(error instanceof AppError);
  assert.equal(error.code, ERROR_CODES.COMMON_VALIDATION_ERROR);
  assert.deepEqual(error.details, {
    fieldErrors: {},
    formErrors: ["Too small: expected string to have >=1 characters"],
  });
});

test("normalizeError maps unknown errors to a common internal AppError", () => {
  const error = normalizeError(new Error("boom"));

  assert.ok(error instanceof AppError);
  assert.equal(error.code, ERROR_CODES.COMMON_INTERNAL_ERROR);
  assert.equal(error.message, "Internal server error");
  assert.equal(error.status, 500);
  assert.equal(error.details, undefined);
});

test("toErrorResponse serializes normalized errors", async () => {
  const response = toErrorResponse(new Error("boom"));

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INTERNAL_ERROR,
      message: "Internal server error",
    },
  });
});
