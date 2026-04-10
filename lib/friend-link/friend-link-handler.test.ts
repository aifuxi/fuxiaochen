import { FriendLinkStatus } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { handleRoute } from "@/lib/api/handle-route";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { createFriendLinkHandler } from "@/lib/friend-link/friend-link-handler";
import type { FriendLinkService } from "@/lib/friend-link/friend-link-service";

const sampleFriendLink = {
  avatarAsset: null,
  avatarAssetId: null,
  createdAt: "2026-04-09T00:00:00.000Z",
  description: "Independent builder notes.",
  domain: "example.com",
  id: "friend_link_1",
  siteName: "Lin Studio",
  siteUrl: "https://example.com",
  sortOrder: 1,
  status: FriendLinkStatus.Approved,
  subtitle: "Builder notes",
  updatedAt: "2026-04-09T00:00:00.000Z",
};

function createServiceStub(overrides: Partial<FriendLinkService> = {}): FriendLinkService {
  return {
    createFriendLink: async () => sampleFriendLink,
    deleteFriendLink: async (id) => ({ id }),
    getFriendLinkById: async () => sampleFriendLink,
    listFriendLinks: async () => ({
      items: [sampleFriendLink],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    }),
    updateFriendLink: async () => sampleFriendLink,
    ...overrides,
  };
}

describe("friend link handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createFriendLinkHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listFriendLinks(request));
    const response = await route(new Request("http://localhost/api/friend-links"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns list response with pagination meta", async () => {
    const handler = createFriendLinkHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.listFriendLinks(request));
    const response = await route(
      new Request("http://localhost/api/friend-links?page=1&pageSize=10&status=Approved"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        items: [sampleFriendLink],
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
    const handler = createFriendLinkHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.createFriendLink(request));
    const response = await route(
      new Request("http://localhost/api/friend-links", {
        body: JSON.stringify({
          description: "Independent builder notes.",
          siteName: "Lin Studio",
          siteUrl: "https://example.com",
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
      data: sampleFriendLink,
      success: true,
    });
  });

  test("returns updated friend link on patch", async () => {
    const handler = createFriendLinkHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.updateFriendLink(request, { id: "friend_link_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/friend-links/friend_link_1", {
        body: JSON.stringify({
          subtitle: "Updated subtitle",
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
      data: sampleFriendLink,
      success: true,
    });
  });

  test("returns deleted friend link id on delete", async () => {
    const handler = createFriendLinkHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) =>
      handler.deleteFriendLink(request, { id: "friend_link_1" }),
    );
    const response = await route(
      new Request("http://localhost/api/friend-links/friend_link_1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        id: "friend_link_1",
      },
      success: true,
    });
  });
});
