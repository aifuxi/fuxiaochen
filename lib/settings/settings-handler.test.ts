import { describe, expect, test } from "vitest";

import { ApiError } from "@/lib/api/api-error";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { handleRoute } from "@/lib/api/handle-route";
import { createSettingsHandler } from "@/lib/settings/settings-handler";
import type { SettingsService } from "@/lib/settings/settings-service";

const sampleSettings = {
  accentColor: "#10B981",
  blogDescription: "A calm editorial system.",
  blogName: "SuperBlog",
  blogUrl: "https://example.com",
  commentSettings: {
    allowAnonymous: false,
    enabled: true,
    maxReplyDepth: 3,
    moderationRequired: true,
    nestedRepliesEnabled: true,
    updatedAt: "2026-04-10T00:00:00.000Z",
  },
  contactEmail: null,
  createdAt: "2026-04-10T00:00:00.000Z",
  defaultMetaDescription: null,
  defaultMetaTitle: null,
  fontFamily: null,
  googleAnalyticsId: null,
  id: 1,
  languageCode: "en",
  sitemapUrl: null,
  theme: "dark",
  timezone: "Asia/Shanghai",
  updatedAt: "2026-04-10T00:00:00.000Z",
};

function createServiceStub(overrides: Partial<SettingsService> = {}): SettingsService {
  return {
    getSettings: async () => sampleSettings,
    updateSettings: async () => sampleSettings,
    ...overrides,
  };
}

describe("settings handler", () => {
  test("returns 401 when request is unauthenticated", async () => {
    const handler = createSettingsHandler({
      requireSession: async () => {
        throw new ApiError({
          code: apiErrorCodes.UNAUTHORIZED,
          message: "Authentication required.",
        });
      },
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.getSettings(request));
    const response = await route(new Request("http://localhost/api/settings"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.UNAUTHORIZED,
      success: false,
    });
  });

  test("returns settings", async () => {
    const handler = createSettingsHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.getSettings(request));
    const response = await route(new Request("http://localhost/api/settings"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: sampleSettings,
      success: true,
    });
  });

  test("updates settings", async () => {
    let updatedBlogName = "";
    const handler = createSettingsHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub({
        updateSettings: async (input) => {
          updatedBlogName = input.blogName;

          return {
            ...sampleSettings,
            blogName: input.blogName,
          };
        },
      }),
    });

    const route = handleRoute(async (request: Request) => handler.updateSettings(request));
    const response = await route(
      new Request("http://localhost/api/settings", {
        body: JSON.stringify({
          accentColor: "#10B981",
          blogDescription: "Updated description",
          blogName: "Updated Blog",
          blogUrl: "https://example.com",
          commentSettings: {
            allowAnonymous: false,
            enabled: true,
            maxReplyDepth: 3,
            moderationRequired: true,
            nestedRepliesEnabled: true,
          },
          contactEmail: null,
          defaultMetaDescription: null,
          defaultMetaTitle: null,
          fontFamily: null,
          googleAnalyticsId: null,
          languageCode: "en",
          sitemapUrl: null,
          theme: "dark",
          timezone: "Asia/Shanghai",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(updatedBlogName).toBe("Updated Blog");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      code: "OK",
      data: {
        blogName: "Updated Blog",
      },
      success: true,
    });
  });

  test("returns 400 for invalid settings payload", async () => {
    const handler = createSettingsHandler({
      requireSession: async () => ({ user: { id: "user_1" } }),
      service: createServiceStub(),
    });

    const route = handleRoute(async (request: Request) => handler.updateSettings(request));
    const response = await route(
      new Request("http://localhost/api/settings", {
        body: JSON.stringify({
          blogName: "",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: apiErrorCodes.VALIDATION_ERROR,
      success: false,
    });
  });
});
