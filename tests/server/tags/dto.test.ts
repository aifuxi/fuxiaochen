import assert from "node:assert/strict";
import test from "node:test";

import {
  tagCreateSchema,
  tagIdParamsSchema,
  tagListQuerySchema,
  tagUpdateSchema,
} from "../../../lib/server/tags/dto";

test("tagCreateSchema accepts non-empty tag fields", () => {
  const result = tagCreateSchema.safeParse({
    name: "Design",
    slug: "design",
    description: "Design notes and assets",
  });

  assert.equal(result.success, true);
});

test("tagCreateSchema rejects empty strings", () => {
  const result = tagCreateSchema.safeParse({
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

test("tagUpdateSchema rejects empty payloads and empty fields", () => {
  const emptyResult = tagUpdateSchema.safeParse({});
  const invalidFieldResult = tagUpdateSchema.safeParse({
    description: "",
  });

  assert.equal(emptyResult.success, false);
  assert.equal(invalidFieldResult.success, false);
});

test("tagIdParamsSchema rejects empty ids", () => {
  const result = tagIdParamsSchema.safeParse({ id: "" });

  assert.equal(result.success, false);
});

test("tagListQuerySchema applies pagination defaults", () => {
  const result = tagListQuerySchema.parse({});

  assert.deepEqual(result, {
    page: 1,
    pageSize: 20,
  });
});

test("tagListQuerySchema parses explicit pagination values", () => {
  const result = tagListQuerySchema.parse({
    page: "3",
    pageSize: "50",
  });

  assert.deepEqual(result, {
    page: 3,
    pageSize: 50,
  });
});

test("tagListQuerySchema rejects oversized page sizes", () => {
  const result = tagListQuerySchema.safeParse({
    pageSize: "101",
  });

  assert.equal(result.success, false);
});
