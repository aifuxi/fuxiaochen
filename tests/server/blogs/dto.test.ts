import assert from "node:assert/strict";
import test from "node:test";

import {
  blogCreateSchema,
  blogIdParamsSchema,
  blogListQuerySchema,
  blogUpdateSchema,
} from "../../../lib/server/blogs/dto";

test("blogCreateSchema requires all required fields and applies defaults", () => {
  const result = blogCreateSchema.parse({
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
  });

  assert.deepEqual(result, {
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    cover: "",
    published: false,
    featured: false,
  });
});

test("blogCreateSchema rejects empty required fields", () => {
  const result = blogCreateSchema.safeParse({
    title: "",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
  });

  assert.equal(result.success, false);
});

test("blogCreateSchema accepts nullable publishedAt and tagIds", () => {
  const result = blogCreateSchema.parse({
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    publishedAt: "2026-04-19T10:00:00.000Z",
    tagIds: ["tag_1", "tag_2"],
  });

  assert.ok(result.publishedAt instanceof Date);
  assert.deepEqual(result.tagIds, ["tag_1", "tag_2"]);

  const nullableResult = blogCreateSchema.parse({
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    publishedAt: null,
  });

  assert.equal(nullableResult.publishedAt, null);
});

test("blogUpdateSchema rejects empty payloads", () => {
  const result = blogUpdateSchema.safeParse({});
  const undefinedOnlyResult = blogUpdateSchema.safeParse({
    title: undefined,
  });

  assert.equal(result.success, false);
  assert.equal(undefinedOnlyResult.success, false);
});

test("blogIdParamsSchema rejects empty ids", () => {
  const result = blogIdParamsSchema.safeParse({ id: "" });

  assert.equal(result.success, false);
});

test("blogListQuerySchema applies defaults", () => {
  const result = blogListQuerySchema.parse({});

  assert.deepEqual(result, {
    page: 1,
    pageSize: 20,
  });
});

test("blogListQuerySchema parses optional filters", () => {
  const result = blogListQuerySchema.parse({
    page: "2",
    pageSize: "50",
    published: "false",
    featured: "true",
    categoryId: "cat_1",
  });

  assert.deepEqual(result, {
    page: 2,
    pageSize: 50,
    published: false,
    featured: true,
    categoryId: "cat_1",
  });
});

test("blogListQuerySchema rejects oversized pageSize", () => {
  const result = blogListQuerySchema.safeParse({
    pageSize: "101",
  });

  assert.equal(result.success, false);
});
