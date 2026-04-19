import assert from "node:assert/strict";
import test from "node:test";

import {
  createBlogHandlers,
  handleCreateBlog,
  handleGetBlog,
  handleUpdateBlog,
} from "../../../lib/server/blogs/handler";
import type { BlogService } from "../../../lib/server/blogs/service";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";

const blogItem = {
  id: "blog_1",
  createdAt: new Date("2026-04-18T10:00:00.000Z"),
  updatedAt: new Date("2026-04-19T10:00:00.000Z"),
  title: "Blog title",
  slug: "blog-title",
  description: "Blog description",
  cover: "",
  content: "Blog content",
  published: true,
  publishedAt: new Date("2026-04-19T08:00:00.000Z"),
  featured: true,
  categoryId: "cat_1",
  category: {
    id: "cat_1",
    name: "Category",
    slug: "category",
  },
  tags: [
    {
      id: "tag_1",
      name: "Tag",
      slug: "tag",
    },
  ],
};

type ValidationErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    details: {
      formErrors: string[];
      fieldErrors: Record<string, string[] | undefined>;
    };
  };
};

function createService(overrides: Partial<BlogService> = {}): BlogService {
  return {
    async listBlogs() {
      return {
        items: [],
        total: 0,
      };
    },
    async getBlog() {
      return blogItem;
    },
    async createBlog() {
      return blogItem;
    },
    async updateBlog() {
      return blogItem;
    },
    async deleteBlog() {},
    ...overrides,
  };
}

test("handleListBlogs returns the shared envelope with pagination meta", async () => {
  const queries: Array<Parameters<BlogService["listBlogs"]>[0]> = [];
  const handlers = createBlogHandlers({
    service: createService({
      async listBlogs(query) {
        queries.push(query);
        return {
          items: [blogItem],
          total: 1,
        };
      },
    }),
  });

  const response = await handlers.handleListBlogs(
    new Request(
      "http://localhost/api/blogs?page=2&pageSize=5&query=admin&published=true&featured=false&categoryId=cat_1&sortBy=updatedAt&sortDirection=asc",
    ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 2,
      pageSize: 5,
      query: "admin",
      published: true,
      featured: false,
      categoryId: "cat_1",
      sortBy: "updatedAt",
      sortDirection: "asc",
    },
  ]);
  assert.deepEqual(await response.json(), {
    success: true,
    data: {
      items: [
        {
          ...blogItem,
          createdAt: "2026-04-18T10:00:00.000Z",
          updatedAt: "2026-04-19T10:00:00.000Z",
          publishedAt: "2026-04-19T08:00:00.000Z",
        },
      ],
    },
    meta: {
      page: 2,
      pageSize: 5,
      total: 1,
    },
  });
});

test("handleListBlogs normalizes invalid query validation errors", async () => {
  const response = await createBlogHandlers({
    service: createService(),
  }).handleListBlogs(
    new Request(
      "http://localhost/api/blogs?published=maybe&page=1&pageSize=10",
    ),
  );

  assert.equal(response.status, 400);

  const payload = (await response.json()) as ValidationErrorPayload;

  assert.equal(payload.success, false);
  assert.equal(payload.error.code, ERROR_CODES.COMMON_VALIDATION_ERROR);
  assert.equal(payload.error.message, "Request validation failed");
  assert.deepEqual(payload.error.details.formErrors, []);
  assert.deepEqual(payload.error.details.fieldErrors.published, [
    "Invalid input",
  ]);
});

test("handleListBlogs normalizes an empty query string to no filter", async () => {
  const queries: Array<Parameters<BlogService["listBlogs"]>[0]> = [];
  const response = await createBlogHandlers({
    service: createService({
      async listBlogs(query) {
        queries.push(query);
        return {
          items: [],
          total: 0,
        };
      },
    }),
  }).handleListBlogs(
    new Request("http://localhost/api/blogs?page=1&pageSize=10&query="),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 1,
      pageSize: 10,
      query: undefined,
      published: undefined,
      featured: undefined,
      categoryId: undefined,
      sortBy: "publishedAt",
      sortDirection: "desc",
    },
  ]);
});

test("handleCreateBlog returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/blogs", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateBlog(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateBlog returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/blogs/blog_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateBlog(
    request,
    Promise.resolve({ id: "blog_1" }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleGetBlog normalizes invalid id param validation errors", async () => {
  const response = await handleGetBlog(
    new Request("http://localhost/api/blogs/%20"),
    Promise.resolve({ id: " " }),
  );

  assert.equal(response.status, 400);

  const payload = (await response.json()) as ValidationErrorPayload;

  assert.equal(payload.success, false);
  assert.equal(payload.error.code, ERROR_CODES.COMMON_VALIDATION_ERROR);
  assert.equal(payload.error.message, "Request validation failed");
  assert.deepEqual(payload.error.details.formErrors, []);
  assert.ok(Array.isArray(payload.error.details.fieldErrors.id));
  assert.equal(payload.error.details.fieldErrors.id.length, 1);
});

test("handleDeleteBlog returns data null on success", async () => {
  const deletedIds: string[] = [];
  const handlers = createBlogHandlers({
    service: createService({
      async deleteBlog(id) {
        deletedIds.push(id);
      },
    }),
  });

  const response = await handlers.handleDeleteBlog(
    new Request("http://localhost/api/blogs/blog_1", {
      method: "DELETE",
    }),
    Promise.resolve({ id: "blog_1" }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(deletedIds, ["blog_1"]);
  assert.deepEqual(await response.json(), {
    success: true,
    data: null,
  });
});
