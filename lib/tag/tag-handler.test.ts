import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createTagHandler } from "@/lib/tag/tag-handler";
import type { TagService } from "@/lib/tag/tag-service";

const sampleTag = {
  createdAt: "2026-04-09T00:00:00.000Z",
  description: null,
  id: "tag_1",
  name: "Architecture",
  slug: "architecture",
  sortOrder: 1,
  updatedAt: "2026-04-09T00:00:00.000Z",
  usageCount: 2,
};

function createServiceStub(overrides: Partial<TagService> = {}): TagService {
  return {
    createTag: async () => sampleTag,
    deleteTag: async (id) => ({ id }),
    getTagById: async () => sampleTag,
    listTags: async () => ({
      items: [sampleTag],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateTag: async () => sampleTag,
    ...overrides,
  };
}

describe("tag handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createTagHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listTags(request));
    const response = await route(new Request("http://localhost/api/tags"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createTagHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listTags(request));
    const response = await route(new Request("http://localhost/api/tags?page=1&pageSize=10"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleTag],
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
    const handler = createTagHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createTag(request));
    const response = await route(
      new Request("http://localhost/api/tags", {
        body: JSON.stringify({
          name: "Architecture",
          slug: "architecture",
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
      data: sampleTag,
      success: true,
    });
  });

  test("returns updated tag on patch", async () => {
    const handler = createTagHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateTag(request, { id: "tag_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/tags/tag_1", {
        body: JSON.stringify({
          name: "Architecture Updated",
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
      data: sampleTag,
      success: true,
    });
  });

  test("returns deleted tag id on delete", async () => {
    const handler = createTagHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteTag(request, { id: "tag_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/tags/tag_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "tag_1",
      },
      success: true,
    });
  });
});
