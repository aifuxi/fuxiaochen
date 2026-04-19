import assert from "node:assert/strict";
import test from "node:test";

import type { TagService } from "../../../lib/server/tags/service";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import {
  createTagHandlers,
  handleCreateTag,
  handleUpdateTag,
} from "../../../lib/server/tags/handler";

function createService(overrides: Partial<TagService> = {}): TagService {
  return {
    async listTags() {
      return {
        items: [],
        total: 0,
      };
    },
    async getTag() {
      throw new Error("unused");
    },
    async createTag() {
      throw new Error("unused");
    },
    async updateTag() {
      throw new Error("unused");
    },
    async deleteTag() {
      throw new Error("unused");
    },
    ...overrides,
  };
}

test("handleListTags forwards query and sort params to the service", async () => {
  const queries: Array<Parameters<TagService["listTags"]>[0]> = [];
  const handlers = createTagHandlers({
    service: createService({
      async listTags(query) {
        queries.push(query);
        return {
          items: [],
          total: 0,
        };
      },
    }),
  });

  const response = await handlers.handleListTags(
    new Request(
      "http://localhost/api/tags?page=2&pageSize=15&query=ux&sortBy=name&sortDirection=asc",
    ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 2,
      pageSize: 15,
      query: "ux",
      sortBy: "name",
      sortDirection: "asc",
    },
  ]);
});

test("handleCreateTag returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/tags", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateTag(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateTag returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/tags/tag_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateTag(
    request,
    Promise.resolve({ id: "tag_1" }),
  );

  assert.equal(response.status, 400);
});
