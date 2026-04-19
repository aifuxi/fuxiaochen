import assert from "node:assert/strict";
import test from "node:test";

import {
  categoryCreateSchema,
  categoryIdParamsSchema,
  categoryListQuerySchema,
  categoryUpdateSchema,
} from "../../../lib/server/categories/dto";

test("categoryCreateSchema accepts non-empty category fields", () => {
  const result = categoryCreateSchema.safeParse({
    name: "Design",
    slug: "design",
    description: "Design notes and assets",
  });

  assert.equal(result.success, true);
});

test("categoryCreateSchema rejects empty strings", () => {
  const result = categoryCreateSchema.safeParse({
    name: "",
    slug: "design",
    description: "Design notes and assets",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.error.flatten().fieldErrors, {
      name: ["Too small: expected string to have >=1 characters"],
    });
  }
});

test("categoryUpdateSchema rejects empty payloads and empty fields", () => {
  const emptyResult = categoryUpdateSchema.safeParse({});
  const invalidFieldResult = categoryUpdateSchema.safeParse({
    description: "",
  });

  assert.equal(emptyResult.success, false);
  assert.equal(invalidFieldResult.success, false);
});

test("categoryIdParamsSchema rejects empty ids", () => {
  const result = categoryIdParamsSchema.safeParse({ id: "" });

  assert.equal(result.success, false);
});

test("categoryListQuerySchema applies pagination defaults", () => {
  const result = categoryListQuerySchema.parse({});

  assert.deepEqual(result, {
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
});

test("categoryListQuerySchema parses search and sort values", () => {
  const result = categoryListQuerySchema.parse({
    page: "3",
    pageSize: "50",
    query: "design",
    sortBy: "name",
    sortDirection: "asc",
  });

  assert.deepEqual(result, {
    page: 3,
    pageSize: 50,
    query: "design",
    sortBy: "name",
    sortDirection: "asc",
  });
});

test("categoryListQuerySchema normalizes empty query to undefined", () => {
  const result = categoryListQuerySchema.parse({
    query: "",
  });

  assert.equal(result.query, undefined);
  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 20);
  assert.equal(result.sortBy, "createdAt");
  assert.equal(result.sortDirection, "desc");
});

test("categoryListQuerySchema rejects oversized pageSize", () => {
  const result = categoryListQuerySchema.safeParse({
    pageSize: "101",
  });

  assert.equal(result.success, false);
});
