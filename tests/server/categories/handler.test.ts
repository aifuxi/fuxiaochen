import assert from "node:assert/strict";
import test from "node:test";

import {
  createCategoryHandlers,
  handleCreateCategory,
  handleUpdateCategory,
} from "../../../lib/server/categories/handler";
import type { CategoryService } from "../../../lib/server/categories/service";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";

function createService(overrides: Partial<CategoryService> = {}): CategoryService {
  return {
    async listCategories() {
      return {
        items: [],
        total: 0,
      };
    },
    async getCategory() {
      throw new Error("unused");
    },
    async createCategory() {
      throw new Error("unused");
    },
    async updateCategory() {
      throw new Error("unused");
    },
    async deleteCategory() {
      throw new Error("unused");
    },
    ...overrides,
  };
}

test("handleListCategories forwards query and sort params to the service", async () => {
  const queries: Array<Parameters<CategoryService["listCategories"]>[0]> = [];
  const handlers = createCategoryHandlers({
    service: createService({
      async listCategories(query) {
        queries.push(query);
        return {
          items: [],
          total: 0,
        };
      },
    }),
  });

  const response = await handlers.handleListCategories(
    new Request(
      "http://localhost/api/categories?page=1&pageSize=20&query=ux&sortBy=updatedAt&sortDirection=desc",
    ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 1,
      pageSize: 20,
      query: "ux",
      sortBy: "updatedAt",
      sortDirection: "desc",
    },
  ]);
});

test("handleListCategories normalizes an empty query string to no filter", async () => {
  const queries: Array<Parameters<CategoryService["listCategories"]>[0]> = [];
  const response = await createCategoryHandlers({
    service: createService({
      async listCategories(query) {
        queries.push(query);
        return {
          items: [],
          total: 0,
        };
      },
    }),
  }).handleListCategories(
    new Request("http://localhost/api/categories?page=1&pageSize=20&query="),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 1,
      pageSize: 20,
      query: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  ]);
});

test("handleCreateCategory returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/categories", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateCategory(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateCategory returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/categories/cat_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateCategory(
    request,
    Promise.resolve({ id: "cat_1" }),
  );

  assert.equal(response.status, 400);
});
