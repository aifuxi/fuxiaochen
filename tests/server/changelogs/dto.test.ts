import assert from "node:assert/strict";
import test from "node:test";

import {
  changelogCreateSchema,
  changelogIdParamsSchema,
  changelogListQuerySchema,
  changelogUpdateSchema,
} from "../../../lib/server/changelogs/dto";

test("changelogCreateSchema accepts non-empty version and content", () => {
  const result = changelogCreateSchema.safeParse({
    version: "1.0.0",
    content: "Initial release notes",
  });

  assert.equal(result.success, true);
});

test("changelogCreateSchema rejects empty version and content", () => {
  const result = changelogCreateSchema.safeParse({
    version: "",
    content: "",
  });

  assert.equal(result.success, false);
});

test("changelogCreateSchema accepts optional releaseDate values", () => {
  const undefinedResult = changelogCreateSchema.safeParse({
    version: "1.0.0",
    content: "Initial release notes",
  });
  const nullResult = changelogCreateSchema.safeParse({
    version: "1.0.0",
    content: "Initial release notes",
    releaseDate: null,
  });

  assert.equal(undefinedResult.success, true);
  assert.equal(nullResult.success, true);
});

test("changelogCreateSchema rejects invalid releaseDate values", () => {
  const invalidResult = changelogCreateSchema.safeParse({
    version: "1.0.0",
    content: "Initial release notes",
    releaseDate: "2026-02-31",
  });

  assert.equal(invalidResult.success, false);
});

test("changelogUpdateSchema rejects empty payloads and empty fields", () => {
  const emptyResult = changelogUpdateSchema.safeParse({});
  const invalidFieldResult = changelogUpdateSchema.safeParse({
    content: "",
  });

  assert.equal(emptyResult.success, false);
  assert.equal(invalidFieldResult.success, false);
});

test("changelogUpdateSchema rejects invalid releaseDate values", () => {
  const result = changelogUpdateSchema.safeParse({
    releaseDate: "2026-13-01",
  });

  assert.equal(result.success, false);
});

test("changelogIdParamsSchema rejects empty ids", () => {
  const result = changelogIdParamsSchema.safeParse({ id: "" });

  assert.equal(result.success, false);
});

test("changelogListQuerySchema applies pagination defaults", () => {
  const result = changelogListQuerySchema.parse({});

  assert.deepEqual(result, {
    page: 1,
    pageSize: 20,
    sortBy: "releaseDate",
    sortDirection: "desc",
  });
});

test("changelogListQuerySchema parses search and sort values", () => {
  const result = changelogListQuerySchema.parse({
    page: "2",
    pageSize: "30",
    query: "1.0",
    sortBy: "updatedAt",
    sortDirection: "asc",
  });

  assert.deepEqual(result, {
    page: 2,
    pageSize: 30,
    query: "1.0",
    sortBy: "updatedAt",
    sortDirection: "asc",
  });
});

test("changelogListQuerySchema clamps pageSize to the configured maximum", () => {
  const result = changelogListQuerySchema.safeParse({
    page: "2",
    pageSize: "101",
  });

  assert.equal(result.success, false);
});
