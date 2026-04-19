import assert from "node:assert/strict";
import test from "node:test";

import type { ChangelogService } from "../../../lib/server/changelogs/service";
import {
  createChangelogHandlers,
  handleCreateChangelog,
  handleUpdateChangelog,
} from "../../../lib/server/changelogs/handler";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";

function createService(
  overrides: Partial<ChangelogService> = {},
): ChangelogService {
  return {
    async listChangelogs() {
      return {
        items: [],
        total: 0,
      };
    },
    async getChangelog() {
      throw new Error("unused");
    },
    async createChangelog() {
      throw new Error("unused");
    },
    async updateChangelog() {
      throw new Error("unused");
    },
    async deleteChangelog() {
      throw new Error("unused");
    },
    ...overrides,
  };
}

test("handleListChangelogs forwards query and sort params to the service", async () => {
  const queries: Array<Parameters<ChangelogService["listChangelogs"]>[0]> = [];
  const handlers = createChangelogHandlers({
    service: createService({
      async listChangelogs(query) {
        queries.push(query);
        return {
          items: [],
          total: 0,
        };
      },
    }),
  });

  const response = await handlers.handleListChangelogs(
    new Request(
      "http://localhost/api/changelogs?page=2&pageSize=15&query=1.0&sortBy=updatedAt&sortDirection=asc",
    ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 2,
      pageSize: 15,
      query: "1.0",
      sortBy: "updatedAt",
      sortDirection: "asc",
    },
  ]);
});

test("handleListChangelogs normalizes an empty query string to no filter", async () => {
  const queries: Array<Parameters<ChangelogService["listChangelogs"]>[0]> = [];
  const response = await createChangelogHandlers({
    service: createService({
      async listChangelogs(query) {
        queries.push(query);
        return {
          items: [],
          total: 0,
        };
      },
    }),
  }).handleListChangelogs(
    new Request("http://localhost/api/changelogs?page=1&pageSize=20&query="),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(queries, [
    {
      page: 1,
      pageSize: 20,
      query: undefined,
      sortBy: "releaseDate",
      sortDirection: "desc",
    },
  ]);
});

test("handleCreateChangelog returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/changelogs", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateChangelog(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateChangelog returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/changelogs/chg_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateChangelog(
    request,
    Promise.resolve({ id: "chg_1" }),
  );

  assert.equal(response.status, 400);
});
