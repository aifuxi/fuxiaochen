import { ChangelogItemType } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createChangelogReleaseHandler } from "@/lib/changelog/changelog-handler";
import type { ChangelogReleaseService } from "@/lib/changelog/changelog-service";

const sampleRelease = {
  createdAt: "2026-04-09T00:00:00.000Z",
  id: "release_1",
  isMajor: false,
  items: [
    {
      description: null,
      id: "item_1",
      itemType: ChangelogItemType.Added,
      sortOrder: 0,
      title: "Added project CRUD API",
    },
  ],
  releasedOn: "2026-04-09T00:00:00.000Z",
  sortOrder: 0,
  summary: "Spring release summary.",
  title: "Spring release",
  version: "v1.2.0",
};

function createServiceStub(overrides: Partial<ChangelogReleaseService> = {}): ChangelogReleaseService {
  return {
    createRelease: async () => sampleRelease,
    deleteRelease: async (id) => ({ id }),
    getReleaseById: async () => sampleRelease,
    listReleases: async () => ({
      items: [sampleRelease],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateRelease: async () => sampleRelease,
    ...overrides,
  };
}

describe("changelog handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createChangelogReleaseHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listReleases(request));
    const response = await route(new Request("http://localhost/api/changelog-releases"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createChangelogReleaseHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listReleases(request));
    const response = await route(new Request("http://localhost/api/changelog-releases?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleRelease],
      },
      meta: {
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      },
      success: true,
    });
  });

  test("returns 201 on create", async () => {
    const handler = createChangelogReleaseHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createRelease(request));
    const response = await route(
      new Request("http://localhost/api/changelog-releases", {
        body: JSON.stringify({
          isMajor: false,
          items: [],
          releasedOn: "2026-04-09",
          title: "Spring release",
          version: "v1.2.0",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleRelease,
      success: true,
    });
  });

  test("returns updated release on patch", async () => {
    const handler = createChangelogReleaseHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateRelease(request, { id: "release_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/changelog-releases/release_1", {
        body: JSON.stringify({
          title: "Updated spring release",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleRelease,
      success: true,
    });
  });

  test("returns deleted release id on delete", async () => {
    const handler = createChangelogReleaseHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteRelease(request, { id: "release_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/changelog-releases/release_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "release_1",
      },
      success: true,
    });
  });
});
