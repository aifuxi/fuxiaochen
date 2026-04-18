import assert from "node:assert/strict";
import test from "node:test";

import type { Blog } from "../../../lib/db/schema";
import {
  blogCreateSchema,
  type BlogCreateInput,
  type BlogUpdateInput,
} from "../../../lib/server/blogs/dto";
import {
  createBlogService,
  type BlogReadModel,
  type BlogRepository,
} from "../../../lib/server/blogs/service";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import { AppError } from "../../../lib/server/http/errors";

const now = new Date("2026-04-19T10:00:00.000Z");

const existingBlog: Blog = {
  id: "blog_existing",
  createdAt: new Date("2026-04-18T10:00:00.000Z"),
  updatedAt: new Date("2026-04-18T10:00:00.000Z"),
  title: "Existing post",
  slug: "existing-post",
  description: "Existing description",
  cover: "",
  content: "Existing content",
  published: false,
  publishedAt: null,
  featured: false,
  categoryId: "cat_1",
};

const existingBlogReadModel: BlogReadModel = {
  ...existingBlog,
  category: null,
  tags: [],
};

function createBlogInput(
  overrides: Partial<BlogCreateInput> = {},
): BlogCreateInput {
  return blogCreateSchema.parse({
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    ...overrides,
  });
}

const expectCreateInput = (_input: BlogCreateInput) => {};
const expectUpdateInput = (_input: BlogUpdateInput) => {};

// @ts-expect-error service inputs must be parsed DTO output, not raw boolean strings
expectCreateInput({ ...createBlogInput(), published: "not-a-bool" });

// @ts-expect-error service inputs must be parsed DTO output, not raw date strings
expectUpdateInput({ publishedAt: "not-a-date" });

function toBlogReadModel(
  blog: Partial<Blog> & Pick<Blog, "id" | "createdAt" | "updatedAt">,
  overrides: Partial<BlogReadModel> = {},
): BlogReadModel {
  return {
    ...blog,
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    description: blog.description ?? "",
    content: blog.content ?? "",
    categoryId: blog.categoryId ?? "",
    cover: blog.cover ?? "",
    published: blog.published ?? false,
    publishedAt: blog.publishedAt ?? null,
    featured: blog.featured ?? false,
    category: null,
    tags: [],
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<BlogRepository> = {},
): BlogRepository {
  return {
    async list() {
      throw new Error("not used");
    },
    async findById() {
      return null;
    },
    async findBySlug() {
      return null;
    },
    async findCategoryById() {
      return null;
    },
    async findTagsByIds() {
      return [];
    },
    async create() {
      throw new Error("not used");
    },
    async update() {
      throw new Error("not used");
    },
    async delete() {
      throw new Error("not used");
    },
    ...overrides,
  };
}

test("listBlogs passes query through to repository", async () => {
  const queries: Array<Parameters<BlogRepository["list"]>[0]> = [];
  const repository = createRepository({
    async list(query) {
      queries.push(query);
      return {
        items: [existingBlogReadModel],
        total: 1,
      };
    },
  });

  const service = createBlogService({ repository });
  const result = await service.listBlogs({
    page: 2,
    pageSize: 10,
    published: true,
    featured: false,
    categoryId: "cat_1",
  });

  assert.deepEqual(queries, [
    {
      page: 2,
      pageSize: 10,
      published: true,
      featured: false,
      categoryId: "cat_1",
    },
  ]);
  assert.deepEqual(result, {
    items: [existingBlogReadModel],
    total: 1,
  });
});

test("getBlog rejects missing blogs with BLOG_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository(),
  });

  await assert.rejects(service.getBlog("blog_missing"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, ERROR_CODES.BLOG_NOT_FOUND);
    assert.equal(error.status, 404);
    return true;
  });
});

test("service consumers must parse DTOs before createBlog", () => {
  const invalid = blogCreateSchema.safeParse({
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    published: "not-a-bool",
    publishedAt: "not-a-date",
  });
  const parsed = blogCreateSchema.parse({
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    published: "true",
    publishedAt: "2026-04-19T10:00:00.000Z",
  });

  assert.equal(invalid.success, false);
  assert.equal(parsed.published, true);
  assert.ok(parsed.publishedAt instanceof Date);
});

test("createBlog generates an id and timestamps before persisting", async () => {
  const calls: Array<Parameters<BlogRepository["create"]>> = [];
  const repository = createRepository({
    async findCategoryById() {
      return { id: "cat_1" };
    },
    async create(blog, options) {
      calls.push([blog, options]);
      return toBlogReadModel(blog);
    },
  });

  const service = createBlogService({
    repository,
    generateId: () => "blog_test_1",
    now: () => now,
  });

  const result = await service.createBlog({
    ...createBlogInput(),
  });

  assert.deepEqual(result, {
    id: "blog_test_1",
    createdAt: now,
    updatedAt: now,
    title: "Post title",
    slug: "post-title",
    description: "Post description",
    content: "## Content",
    categoryId: "cat_1",
    cover: "",
    published: false,
    publishedAt: null,
    featured: false,
    category: null,
    tags: [],
  });
  assert.deepEqual(calls, [
    [
      {
        id: "blog_test_1",
        createdAt: now,
        updatedAt: now,
        title: "Post title",
        slug: "post-title",
        description: "Post description",
        content: "## Content",
        categoryId: "cat_1",
        cover: "",
        published: false,
        publishedAt: null,
        featured: false,
      },
      { tagIds: [] },
    ],
  ]);
});

test("createBlog rejects missing categories with BLOG_CATEGORY_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository(),
  });

  await assert.rejects(
    service.createBlog({
      ...createBlogInput({
        categoryId: "cat_missing",
      }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_CATEGORY_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("createBlog rejects missing tag ids with BLOG_TAGS_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findCategoryById() {
        return { id: "cat_1" };
      },
      async findTagsByIds(ids) {
        return ids.filter((id) => id === "tag_1").map((id) => ({ id }));
      },
    }),
  });

  await assert.rejects(
    service.createBlog({
      ...createBlogInput({
        tagIds: ["tag_1", "tag_missing"],
      }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_TAGS_NOT_FOUND);
      assert.equal(error.status, 404);
      assert.deepEqual(error.details, {
        missingTagIds: ["tag_missing"],
      });
      return true;
    },
  );
});

test("createBlog deduplicates tag ids before persisting", async () => {
  const calls: Array<Parameters<BlogRepository["create"]>[1]> = [];
  const repository = createRepository({
    async findCategoryById() {
      return { id: "cat_1" };
    },
    async findTagsByIds(ids) {
      return ids.map((id) => ({ id }));
    },
    async create(_blog, options) {
      calls.push(options);
      return existingBlogReadModel;
    },
  });

  const service = createBlogService({
    repository,
    generateId: () => "blog_test_1",
    now: () => now,
  });

  await service.createBlog({
    ...createBlogInput({
      tagIds: ["tag_1", "tag_1", "tag_2"],
    }),
  });

  assert.deepEqual(calls, [{ tagIds: ["tag_1", "tag_2"] }]);
});

test("createBlog rejects duplicate slugs before persisting", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findBySlug() {
        return existingBlogReadModel;
      },
      async findCategoryById() {
        return { id: "cat_1" };
      },
    }),
  });

  await assert.rejects(
    service.createBlog({
      ...createBlogInput({
        slug: "existing-post",
      }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("createBlog normalizes repository duplicate slug errors", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findCategoryById() {
        return { id: "cat_1" };
      },
      async create() {
        throw Object.assign(new Error("duplicate key"), {
          code: "23505",
          constraint: "blogs_slug_key",
        });
      },
    }),
  });

  await assert.rejects(
    service.createBlog({
      ...createBlogInput(),
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("createBlog normalizes category foreign key write races", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findCategoryById() {
        return { id: "cat_1" };
      },
      async create() {
        throw Object.assign(new Error("foreign key violation"), {
          code: "23503",
          constraint: "blogs_category_id_fkey",
        });
      },
    }),
  });

  await assert.rejects(
    service.createBlog({
      ...createBlogInput(),
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_CATEGORY_NOT_FOUND);
      assert.equal(error.status, 404);
      assert.deepEqual(error.details, { categoryId: "cat_1" });
      return true;
    },
  );
});

test("createBlog normalizes tag foreign key write races", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findCategoryById() {
        return { id: "cat_1" };
      },
      async findTagsByIds(ids) {
        return ids.map((id) => ({ id }));
      },
      async create() {
        throw Object.assign(new Error("foreign key violation"), {
          code: "23503",
          constraint: "blog_tags_tag_id_fkey",
        });
      },
    }),
  });

  await assert.rejects(
    service.createBlog({
      ...createBlogInput({
        tagIds: ["tag_1", "tag_2"],
      }),
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_TAGS_NOT_FOUND);
      assert.equal(error.status, 404);
      assert.deepEqual(error.details, {
        missingTagIds: ["tag_1", "tag_2"],
      });
      return true;
    },
  );
});

test("updateBlog rejects missing blogs with BLOG_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository(),
  });

  await assert.rejects(
    service.updateBlog("blog_missing", {
      title: "Updated title",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("updateBlog rejects pre-write duplicate slugs with BLOG_SLUG_CONFLICT", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async findBySlug() {
        return {
          ...existingBlogReadModel,
          id: "blog_other",
          slug: "next-post",
        };
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      slug: "next-post",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("updateBlog rejects missing categories with BLOG_CATEGORY_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      categoryId: "cat_missing",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_CATEGORY_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("updateBlog rejects missing tag ids with BLOG_TAGS_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async findTagsByIds(ids) {
        return ids.filter((id) => id === "tag_1").map((id) => ({ id }));
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      tagIds: ["tag_1", "tag_missing"],
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_TAGS_NOT_FOUND);
      assert.equal(error.status, 404);
      assert.deepEqual(error.details, {
        missingTagIds: ["tag_missing"],
      });
      return true;
    },
  );
});

test("updateBlog preserves tag relations when tagIds are omitted", async () => {
  const calls: Array<Parameters<BlogRepository["update"]>> = [];
  const repository = createRepository({
    async findById() {
      return existingBlogReadModel;
    },
    async update(id, input, options) {
      calls.push([id, input, options]);
      return toBlogReadModel({ ...existingBlogReadModel, ...input });
    },
  });

  const service = createBlogService({
    repository,
    now: () => now,
  });

  await service.updateBlog(existingBlog.id, {
    title: "Updated title",
  });

  assert.deepEqual(calls, [
    [
      existingBlog.id,
      {
        title: "Updated title",
        updatedAt: now,
      },
      {},
    ],
  ]);
});

test("updateBlog validates and replaces deduplicated tag ids when provided", async () => {
  const calls: Array<Parameters<BlogRepository["update"]>> = [];
  const repository = createRepository({
    async findById() {
      return existingBlogReadModel;
    },
    async findTagsByIds(ids) {
      return ids.map((id) => ({ id }));
    },
    async update(id, input, options) {
      calls.push([id, input, options]);
      return toBlogReadModel({ ...existingBlogReadModel, ...input });
    },
  });

  const service = createBlogService({
    repository,
    now: () => now,
  });

  await service.updateBlog(existingBlog.id, {
    tagIds: ["tag_1", "tag_1", "tag_2"],
  });

  assert.deepEqual(calls, [
    [
      existingBlog.id,
      {
        updatedAt: now,
      },
      {
        replaceTagIds: ["tag_1", "tag_2"],
      },
    ],
  ]);
});

test("updateBlog normalizes repository duplicate slug errors", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async update() {
        throw Object.assign(new Error("duplicate key"), {
          code: "23505",
          constraint: "blogs_slug_key",
        });
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      slug: "next-post",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_SLUG_CONFLICT);
      assert.equal(error.status, 409);
      return true;
    },
  );
});

test("updateBlog normalizes category foreign key write races", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async findCategoryById() {
        return { id: "cat_2" };
      },
      async update() {
        throw Object.assign(new Error("foreign key violation"), {
          code: "23503",
          constraint: "blogs_category_id_fkey",
        });
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      categoryId: "cat_2",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_CATEGORY_NOT_FOUND);
      assert.equal(error.status, 404);
      assert.deepEqual(error.details, { categoryId: "cat_2" });
      return true;
    },
  );
});

test("updateBlog normalizes tag foreign key write races", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async findTagsByIds(ids) {
        return ids.map((id) => ({ id }));
      },
      async update() {
        throw Object.assign(new Error("foreign key violation"), {
          code: "23503",
          constraint: "blog_tags_tag_id_fkey",
        });
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      tagIds: ["tag_1", "tag_2"],
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_TAGS_NOT_FOUND);
      assert.equal(error.status, 404);
      assert.deepEqual(error.details, {
        missingTagIds: ["tag_1", "tag_2"],
      });
      return true;
    },
  );
});

test("updateBlog converts null repository responses into BLOG_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async update() {
        return null;
      },
    }),
  });

  await assert.rejects(
    service.updateBlog(existingBlog.id, {
      title: "Updated title",
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});

test("deleteBlog rejects missing blogs with BLOG_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository(),
  });

  await assert.rejects(service.deleteBlog("blog_missing"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.code, ERROR_CODES.BLOG_NOT_FOUND);
    assert.equal(error.status, 404);
    return true;
  });
});

test("deleteBlog converts delete races into BLOG_NOT_FOUND", async () => {
  const service = createBlogService({
    repository: createRepository({
      async findById() {
        return existingBlogReadModel;
      },
      async delete() {
        return false;
      },
    }),
  });

  await assert.rejects(
    service.deleteBlog(existingBlog.id),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.code, ERROR_CODES.BLOG_NOT_FOUND);
      assert.equal(error.status, 404);
      return true;
    },
  );
});
