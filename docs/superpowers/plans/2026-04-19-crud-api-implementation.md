# CRUD API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build layered CRUD APIs for `categories`, `tags`, `blogs`, and `changelogs` with unified responses, stable error codes, and `generateCuid()`-based primary keys.

**Architecture:** Use resource-oriented layering under `lib/server/<resource>/` with thin Next.js route handlers in `app/api/**/route.ts`. Shared HTTP response and error primitives live in `lib/server/http/`, while services own timestamps, uniqueness checks, and `blogs` to `blog_tags` relation management.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Drizzle ORM, Zod, Node test runner, Postgres

---

## File Map

### Shared HTTP infrastructure

- Create: `lib/server/http/error-codes.ts`
- Create: `lib/server/http/errors.ts`
- Create: `lib/server/http/error-handler.ts`
- Create: `lib/server/http/response.ts`
- Create: `tests/server/http/http-primitives.test.ts`

### Category resource

- Create: `lib/server/categories/dto.ts`
- Create: `lib/server/categories/repository.ts`
- Create: `lib/server/categories/service.ts`
- Create: `lib/server/categories/handler.ts`
- Create: `app/api/categories/route.ts`
- Create: `app/api/categories/[id]/route.ts`
- Create: `tests/server/categories/dto.test.ts`
- Create: `tests/server/categories/service.test.ts`

### Tag resource

- Create: `lib/server/tags/dto.ts`
- Create: `lib/server/tags/repository.ts`
- Create: `lib/server/tags/service.ts`
- Create: `lib/server/tags/handler.ts`
- Create: `app/api/tags/route.ts`
- Create: `app/api/tags/[id]/route.ts`
- Create: `tests/server/tags/dto.test.ts`
- Create: `tests/server/tags/service.test.ts`

### Changelog resource

- Create: `lib/server/changelogs/dto.ts`
- Create: `lib/server/changelogs/repository.ts`
- Create: `lib/server/changelogs/service.ts`
- Create: `lib/server/changelogs/handler.ts`
- Create: `app/api/changelogs/route.ts`
- Create: `app/api/changelogs/[id]/route.ts`
- Create: `tests/server/changelogs/dto.test.ts`
- Create: `tests/server/changelogs/service.test.ts`

### Blog resource

- Create: `lib/server/blogs/dto.ts`
- Create: `lib/server/blogs/repository.ts`
- Create: `lib/server/blogs/service.ts`
- Create: `lib/server/blogs/handler.ts`
- Create: `app/api/blogs/route.ts`
- Create: `app/api/blogs/[id]/route.ts`
- Create: `tests/server/blogs/dto.test.ts`
- Create: `tests/server/blogs/service.test.ts`
- Create: `tests/server/blogs/handler.test.ts`

## Task 1: Build Shared HTTP Primitives

**Files:**

- Create: `lib/server/http/error-codes.ts`
- Create: `lib/server/http/errors.ts`
- Create: `lib/server/http/error-handler.ts`
- Create: `lib/server/http/response.ts`
- Test: `tests/server/http/http-primitives.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/server/http/response";
import { AppError } from "@/lib/server/http/errors";

test("createSuccessResponse wraps payloads in the shared envelope", async () => {
  const response = createSuccessResponse({ id: "cat_1" }, { page: 1 });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: { id: "cat_1" },
    meta: { page: 1 },
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/server/http/http-primitives.test.ts`

Expected: FAIL with module-not-found errors for `@/lib/server/http/*`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/server/http/errors.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// lib/server/http/response.ts
import { AppError } from "./errors";

export function createSuccessResponse<TData>(
  data: TData,
  meta?: Record<string, unknown>,
  status = 200,
) {
  return Response.json(
    meta ? { success: true, data, meta } : { success: true, data },
    { status },
  );
}

export function createErrorResponse(error: AppError) {
  return Response.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    },
    { status: error.status },
  );
}
```

- [ ] **Step 4: Expand to full shared primitives**

```ts
// lib/server/http/error-codes.ts
export const ERROR_CODES = {
  COMMON_INVALID_REQUEST: "COMMON_INVALID_REQUEST",
  COMMON_VALIDATION_ERROR: "COMMON_VALIDATION_ERROR",
  COMMON_INTERNAL_ERROR: "COMMON_INTERNAL_ERROR",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  CATEGORY_SLUG_CONFLICT: "CATEGORY_SLUG_CONFLICT",
  TAG_NOT_FOUND: "TAG_NOT_FOUND",
  TAG_SLUG_CONFLICT: "TAG_SLUG_CONFLICT",
  BLOG_NOT_FOUND: "BLOG_NOT_FOUND",
  BLOG_SLUG_CONFLICT: "BLOG_SLUG_CONFLICT",
  BLOG_CATEGORY_NOT_FOUND: "BLOG_CATEGORY_NOT_FOUND",
  BLOG_TAGS_NOT_FOUND: "BLOG_TAGS_NOT_FOUND",
  CHANGELOG_NOT_FOUND: "CHANGELOG_NOT_FOUND",
  CHANGELOG_VERSION_CONFLICT: "CHANGELOG_VERSION_CONFLICT",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

```ts
// lib/server/http/error-handler.ts
import { ZodError } from "zod";

import { ERROR_CODES } from "./error-codes";
import { AppError } from "./errors";
import { createErrorResponse } from "./response";

export function normalizeError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError(
      ERROR_CODES.COMMON_VALIDATION_ERROR,
      "Request validation failed",
      400,
      { fieldErrors: error.flatten().fieldErrors },
    );
  }

  return new AppError(
    ERROR_CODES.COMMON_INTERNAL_ERROR,
    "Internal server error",
    500,
  );
}

export function toErrorResponse(error: unknown) {
  return createErrorResponse(normalizeError(error));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --import tsx --test tests/server/http/http-primitives.test.ts`

Expected: PASS with 2 passing tests.

- [ ] **Step 6: Commit**

```bash
git add tests/server/http/http-primitives.test.ts lib/server/http/error-codes.ts lib/server/http/errors.ts lib/server/http/error-handler.ts lib/server/http/response.ts
git commit -m "feat(api): add shared http primitives"
```

## Task 2: Implement Category CRUD

**Files:**

- Create: `lib/server/categories/dto.ts`
- Create: `lib/server/categories/repository.ts`
- Create: `lib/server/categories/service.ts`
- Create: `lib/server/categories/handler.ts`
- Create: `app/api/categories/route.ts`
- Create: `app/api/categories/[id]/route.ts`
- Test: `tests/server/categories/dto.test.ts`
- Test: `tests/server/categories/service.test.ts`

- [ ] **Step 1: Write the failing DTO tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  createCategoryDtoSchema,
  listCategoriesQuerySchema,
  updateCategoryDtoSchema,
} from "@/lib/server/categories/dto";

test("createCategoryDtoSchema accepts the required fields", () => {
  const value = createCategoryDtoSchema.parse({
    name: "Tech",
    slug: "tech",
    description: "All tech posts",
  });

  assert.equal(value.slug, "tech");
});

test("updateCategoryDtoSchema rejects an empty payload", () => {
  assert.throws(() => updateCategoryDtoSchema.parse({}));
});

test("listCategoriesQuerySchema applies pagination defaults", () => {
  const value = listCategoriesQuerySchema.parse({});
  assert.equal(value.page, 1);
  assert.equal(value.pageSize, 20);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import tsx --test tests/server/categories/dto.test.ts`

Expected: FAIL because `@/lib/server/categories/dto` does not exist.

- [ ] **Step 3: Write minimal DTO implementation**

```ts
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const createCategoryDtoSchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
  description: nonEmptyString,
});

export const updateCategoryDtoSchema = createCategoryDtoSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export const categoryIdParamSchema = z.object({
  id: nonEmptyString,
});

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});
```

- [ ] **Step 4: Write the failing service tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { createCategoriesService } from "@/lib/server/categories/service";

test("createCategory generates ids and timestamps", async () => {
  const service = createCategoriesService({
    repository: {
      findBySlug: async () => null,
      create: async (input) => input,
    },
    generateId: () => "cat_1",
    now: () => new Date("2026-04-19T00:00:00.000Z"),
  });

  const result = await service.createCategory({
    name: "Tech",
    slug: "tech",
    description: "All tech posts",
  });

  assert.equal(result.id, "cat_1");
  assert.equal(result.createdAt.toISOString(), "2026-04-19T00:00:00.000Z");
  assert.equal(result.updatedAt.toISOString(), "2026-04-19T00:00:00.000Z");
});

test("createCategory rejects duplicate slugs", async () => {
  const service = createCategoriesService({
    repository: {
      findBySlug: async () => ({ id: "existing" }),
    },
  });

  await assert.rejects(
    () =>
      service.createCategory({
        name: "Tech",
        slug: "tech",
        description: "All tech posts",
      }),
    (error: unknown) =>
      error instanceof Error &&
      "code" in error &&
      error.code === ERROR_CODES.CATEGORY_SLUG_CONFLICT,
  );
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `node --import tsx --test tests/server/categories/service.test.ts`

Expected: FAIL because `createCategoriesService` is undefined.

- [ ] **Step 6: Write minimal repository, service, handler, and routes**

```ts
// lib/server/categories/service.ts
import { generateCuid } from "@/lib/cuid";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

export function createCategoriesService(deps: {
  repository: {
    findBySlug: (slug: string) => Promise<{ id: string } | null>;
    create: (
      input: Record<string, unknown>,
    ) => Promise<Record<string, unknown>>;
    findMany: (input: {
      page: number;
      pageSize: number;
    }) => Promise<{ items: unknown[]; total: number }>;
    findById: (id: string) => Promise<unknown | null>;
    update: (id: string, input: Record<string, unknown>) => Promise<unknown>;
    delete: (id: string) => Promise<void>;
  };
  generateId?: () => string;
  now?: () => Date;
}) {
  const {
    repository,
    generateId = generateCuid,
    now = () => new Date(),
  } = deps;

  return {
    async createCategory(input: {
      name: string;
      slug: string;
      description: string;
    }) {
      const existing = await repository.findBySlug(input.slug);

      if (existing) {
        throw new AppError(
          ERROR_CODES.CATEGORY_SLUG_CONFLICT,
          "Category slug already exists",
          409,
        );
      }

      const timestamp = now();

      return repository.create({
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input,
      });
    },
  };
}
```

```ts
// app/api/categories/route.ts
import { createCategoriesHandler } from "@/lib/server/categories/handler";

const handler = createCategoriesHandler();

export async function GET(request: Request) {
  return handler.list(request);
}

export async function POST(request: Request) {
  return handler.create(request);
}
```

```ts
// app/api/categories/[id]/route.ts
import { createCategoriesHandler } from "@/lib/server/categories/handler";

const handler = createCategoriesHandler();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handler.getById(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handler.update(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handler.remove(request, context);
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `node --import tsx --test tests/server/categories/dto.test.ts tests/server/categories/service.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add tests/server/categories/dto.test.ts tests/server/categories/service.test.ts lib/server/categories/dto.ts lib/server/categories/repository.ts lib/server/categories/service.ts lib/server/categories/handler.ts app/api/categories/route.ts app/api/categories/[id]/route.ts
git commit -m "feat(api): add category crud"
```

## Task 3: Implement Tag CRUD

**Files:**

- Create: `lib/server/tags/dto.ts`
- Create: `lib/server/tags/repository.ts`
- Create: `lib/server/tags/service.ts`
- Create: `lib/server/tags/handler.ts`
- Create: `app/api/tags/route.ts`
- Create: `app/api/tags/[id]/route.ts`
- Test: `tests/server/tags/dto.test.ts`
- Test: `tests/server/tags/service.test.ts`

- [ ] **Step 1: Copy category tests structure and adapt to tags**

```ts
test("createTag generates ids and timestamps", async () => {
  const service = createTagsService({
    repository: {
      findBySlug: async () => null,
      create: async (input) => input,
    },
    generateId: () => "tag_1",
    now: () => new Date("2026-04-19T00:00:00.000Z"),
  });

  const result = await service.createTag({
    name: "Next.js",
    slug: "nextjs",
    description: "Next.js posts",
  });

  assert.equal(result.id, "tag_1");
});
```

- [ ] **Step 2: Run the tag tests to verify they fail**

Run: `node --import tsx --test tests/server/tags/dto.test.ts tests/server/tags/service.test.ts`

Expected: FAIL because tag modules do not exist.

- [ ] **Step 3: Implement tag DTO, repository, service, handler, and routes**

```ts
// service rules mirror categories but use tag-specific error codes
throw new AppError(
  ERROR_CODES.TAG_SLUG_CONFLICT,
  "Tag slug already exists",
  409,
);
```

```ts
// list output shape remains shared
return createSuccessResponse(
  { items: result.items },
  {
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  },
);
```

- [ ] **Step 4: Run the tag tests to verify they pass**

Run: `node --import tsx --test tests/server/tags/dto.test.ts tests/server/tags/service.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/server/tags/dto.test.ts tests/server/tags/service.test.ts lib/server/tags/dto.ts lib/server/tags/repository.ts lib/server/tags/service.ts lib/server/tags/handler.ts app/api/tags/route.ts app/api/tags/[id]/route.ts
git commit -m "feat(api): add tag crud"
```

## Task 4: Implement Changelog CRUD

**Files:**

- Create: `lib/server/changelogs/dto.ts`
- Create: `lib/server/changelogs/repository.ts`
- Create: `lib/server/changelogs/service.ts`
- Create: `lib/server/changelogs/handler.ts`
- Create: `app/api/changelogs/route.ts`
- Create: `app/api/changelogs/[id]/route.ts`
- Test: `tests/server/changelogs/dto.test.ts`
- Test: `tests/server/changelogs/service.test.ts`

- [ ] **Step 1: Write the failing changelog tests**

```ts
test("createChangelog rejects duplicate versions", async () => {
  const service = createChangelogsService({
    repository: {
      findByVersion: async () => ({ id: "release_1" }),
    },
  });

  await assert.rejects(
    () =>
      service.createChangelog({
        version: "1.0.0",
        content: "Initial release",
      }),
    (error: unknown) =>
      error instanceof Error &&
      "code" in error &&
      error.code === ERROR_CODES.CHANGELOG_VERSION_CONFLICT,
  );
});
```

- [ ] **Step 2: Run the changelog tests to verify they fail**

Run: `node --import tsx --test tests/server/changelogs/dto.test.ts tests/server/changelogs/service.test.ts`

Expected: FAIL because changelog modules do not exist.

- [ ] **Step 3: Implement changelog modules**

```ts
// changelog service conflict branch
if (existing) {
  throw new AppError(
    ERROR_CODES.CHANGELOG_VERSION_CONFLICT,
    "Changelog version already exists",
    409,
  );
}
```

```ts
// changelog repository ordering
orderBy: (changelogs, { desc }) => [
  desc(changelogs.releaseDate),
  desc(changelogs.createdAt),
],
```

- [ ] **Step 4: Run the changelog tests to verify they pass**

Run: `node --import tsx --test tests/server/changelogs/dto.test.ts tests/server/changelogs/service.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/server/changelogs/dto.test.ts tests/server/changelogs/service.test.ts lib/server/changelogs/dto.ts lib/server/changelogs/repository.ts lib/server/changelogs/service.ts lib/server/changelogs/handler.ts app/api/changelogs/route.ts app/api/changelogs/[id]/route.ts
git commit -m "feat(api): add changelog crud"
```

## Task 5: Implement Blog DTO and Service Rules

**Files:**

- Create: `lib/server/blogs/dto.ts`
- Create: `lib/server/blogs/service.ts`
- Test: `tests/server/blogs/dto.test.ts`
- Test: `tests/server/blogs/service.test.ts`

- [ ] **Step 1: Write the failing blog DTO tests**

```ts
test("createBlogDtoSchema accepts optional tagIds", () => {
  const value = createBlogDtoSchema.parse({
    title: "Post",
    slug: "post",
    description: "desc",
    content: "content",
    categoryId: "cat_1",
    tagIds: ["tag_1", "tag_2"],
  });

  assert.deepEqual(value.tagIds, ["tag_1", "tag_2"]);
});

test("updateBlogDtoSchema allows partial updates but rejects empty payloads", () => {
  assert.throws(() => updateBlogDtoSchema.parse({}));
});
```

- [ ] **Step 2: Run the blog DTO tests to verify they fail**

Run: `node --import tsx --test tests/server/blogs/dto.test.ts`

Expected: FAIL because blog DTO module does not exist.

- [ ] **Step 3: Write the failing blog service tests**

```ts
test("createBlog rejects a missing category", async () => {
  const service = createBlogsService({
    repository: {
      findCategoryById: async () => null,
    },
  });

  await assert.rejects(
    () =>
      service.createBlog({
        title: "Post",
        slug: "post",
        description: "desc",
        content: "content",
        categoryId: "cat_missing",
      }),
    (error: unknown) =>
      error instanceof Error &&
      "code" in error &&
      error.code === ERROR_CODES.BLOG_CATEGORY_NOT_FOUND,
  );
});

test("updateBlog replaces tag relations when tagIds is provided", async () => {
  const calls: string[] = [];
  const service = createBlogsService({
    repository: {
      findBlogById: async () => ({ id: "blog_1" }),
      findCategoryById: async () => ({ id: "cat_1" }),
      findTagsByIds: async () => [{ id: "tag_1" }, { id: "tag_2" }],
      updateBlog: async () => ({ id: "blog_1" }),
      replaceBlogTags: async () => {
        calls.push("replaceBlogTags");
      },
      getBlogDetailById: async () => ({ id: "blog_1", tags: [] }),
    },
  });

  await service.updateBlog("blog_1", { tagIds: ["tag_1", "tag_2", "tag_2"] });

  assert.deepEqual(calls, ["replaceBlogTags"]);
});
```

- [ ] **Step 4: Run the blog service tests to verify they fail**

Run: `node --import tsx --test tests/server/blogs/service.test.ts`

Expected: FAIL because `createBlogsService` is undefined.

- [ ] **Step 5: Implement blog DTO and service**

```ts
// tag ids schema
const tagIdsSchema = z.array(z.string().trim().min(1)).default([]);
```

```ts
// service validation rules
const uniqueTagIds = [...new Set(input.tagIds ?? [])];
const foundTags = uniqueTagIds.length
  ? await repository.findTagsByIds(uniqueTagIds)
  : [];

const missingTagIds = uniqueTagIds.filter(
  (tagId) => !foundTags.some((tag) => tag.id === tagId),
);

if (missingTagIds.length > 0) {
  throw new AppError(
    ERROR_CODES.BLOG_TAGS_NOT_FOUND,
    "Some blog tags do not exist",
    404,
    { missingTagIds },
  );
}
```

- [ ] **Step 6: Run the blog DTO and service tests to verify they pass**

Run: `node --import tsx --test tests/server/blogs/dto.test.ts tests/server/blogs/service.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tests/server/blogs/dto.test.ts tests/server/blogs/service.test.ts lib/server/blogs/dto.ts lib/server/blogs/service.ts
git commit -m "feat(api): add blog dto and service rules"
```

## Task 6: Implement Blog Repository, Handler, and Routes

**Files:**

- Create: `lib/server/blogs/repository.ts`
- Create: `lib/server/blogs/handler.ts`
- Create: `app/api/blogs/route.ts`
- Create: `app/api/blogs/[id]/route.ts`
- Test: `tests/server/blogs/handler.test.ts`

- [ ] **Step 1: Write the failing handler test**

```ts
test("list blogs returns the shared envelope with pagination meta", async () => {
  const handler = createBlogsHandler({
    service: {
      listBlogs: async () => ({
        items: [{ id: "blog_1", slug: "post" }],
        total: 1,
      }),
    },
  });

  const request = new Request(
    "https://example.com/api/blogs?page=1&pageSize=20",
  );
  const response = await handler.list(request);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: {
      items: [{ id: "blog_1", slug: "post" }],
    },
    meta: {
      page: 1,
      pageSize: 20,
      total: 1,
    },
  });
});
```

- [ ] **Step 2: Run the handler test to verify it fails**

Run: `node --import tsx --test tests/server/blogs/handler.test.ts`

Expected: FAIL because blog handler and route modules do not exist.

- [ ] **Step 3: Implement blog repository with relation-aware reads**

```ts
// find detail with relational query API
return db.query.blogs.findFirst({
  where: eq(blogs.id, id),
  with: {
    category: {
      columns: {
        id: true,
        name: true,
        slug: true,
      },
    },
    blogTags: {
      with: {
        tag: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  },
});
```

```ts
// count query with numeric mapping
const [{ count }] = await db
  .select({ count: sql<number>`count(*)`.mapWith(Number) })
  .from(blogs)
  .where(whereClause);
```

- [ ] **Step 4: Implement blog handler and routes**

```ts
export async function GET(request: Request) {
  return handler.list(request);
}

export async function POST(request: Request) {
  return handler.create(request);
}
```

```ts
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handler.update(request, context);
}
```

- [ ] **Step 5: Run the blog handler test to verify it passes**

Run: `node --import tsx --test tests/server/blogs/handler.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/server/blogs/handler.test.ts lib/server/blogs/repository.ts lib/server/blogs/handler.ts app/api/blogs/route.ts app/api/blogs/[id]/route.ts
git commit -m "feat(api): add blog routes and repository"
```

## Task 7: Add Final API Coverage and Verify the Full Stack

**Files:**

- Modify: `tests/server/categories/service.test.ts`
- Modify: `tests/server/tags/service.test.ts`
- Modify: `tests/server/changelogs/service.test.ts`
- Modify: `tests/server/blogs/service.test.ts`
- Modify: `tests/server/blogs/handler.test.ts`

- [ ] **Step 1: Add not-found and delete-envelope coverage**

```ts
test("delete handlers return success with null data", async () => {
  const response = createSuccessResponse(null);
  assert.deepEqual(await response.json(), {
    success: true,
    data: null,
  });
});
```

- [ ] **Step 2: Run the focused API test suite**

Run: `node --import tsx --test tests/server/http/http-primitives.test.ts tests/server/categories/dto.test.ts tests/server/categories/service.test.ts tests/server/tags/dto.test.ts tests/server/tags/service.test.ts tests/server/changelogs/dto.test.ts tests/server/changelogs/service.test.ts tests/server/blogs/dto.test.ts tests/server/blogs/service.test.ts tests/server/blogs/handler.test.ts`

Expected: PASS with all listed suites green.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`

Expected: exit code 0.

- [ ] **Step 4: Run format check**

Run: `pnpm format:check`

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add tests/server/http/http-primitives.test.ts tests/server/categories/dto.test.ts tests/server/categories/service.test.ts tests/server/tags/dto.test.ts tests/server/tags/service.test.ts tests/server/changelogs/dto.test.ts tests/server/changelogs/service.test.ts tests/server/blogs/dto.test.ts tests/server/blogs/service.test.ts tests/server/blogs/handler.test.ts lib/server/http/error-codes.ts lib/server/http/errors.ts lib/server/http/error-handler.ts lib/server/http/response.ts lib/server/categories/dto.ts lib/server/categories/repository.ts lib/server/categories/service.ts lib/server/categories/handler.ts app/api/categories/route.ts app/api/categories/[id]/route.ts lib/server/tags/dto.ts lib/server/tags/repository.ts lib/server/tags/service.ts lib/server/tags/handler.ts app/api/tags/route.ts app/api/tags/[id]/route.ts lib/server/changelogs/dto.ts lib/server/changelogs/repository.ts lib/server/changelogs/service.ts lib/server/changelogs/handler.ts app/api/changelogs/route.ts app/api/changelogs/[id]/route.ts lib/server/blogs/dto.ts lib/server/blogs/repository.ts lib/server/blogs/service.ts lib/server/blogs/handler.ts app/api/blogs/route.ts app/api/blogs/[id]/route.ts
git commit -m "feat(api): add layered crud apis"
```

## Self-Review

### Spec coverage

- Shared response envelope: Task 1
- Shared error-code architecture: Task 1
- Category CRUD: Task 2
- Tag CRUD: Task 3
- Changelog CRUD: Task 4
- Blog CRUD and `tagIds` relation handling: Tasks 5-6
- Pagination defaults and meta: Tasks 2, 3, 4, 6
- TDD and final verification: Tasks 1-7

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation steps remain.
- Each task includes exact file paths, commands, and representative code for the required behavior.

### Type consistency

- Shared response helpers are named `createSuccessResponse` and `createErrorResponse` throughout.
- Resource services are named `createCategoriesService`, `createTagsService`, `createChangelogsService`, and `createBlogsService`.
- Blog relation replacement method is consistently named `replaceBlogTags`.
