import { describe, expect, test } from "vitest";

import type { SettingsRepository } from "@/lib/settings/settings-repository";
import { createSettingsService } from "@/lib/settings/settings-service";

const baseSettingsRecord = {
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
    updatedAt: new Date("2026-04-10T00:00:00.000Z"),
  },
  contactEmail: "owner@example.com",
  createdAt: new Date("2026-04-10T00:00:00.000Z"),
  defaultMetaDescription: "Default description",
  defaultMetaTitle: "Default title",
  fontFamily: "Inter",
  googleAnalyticsId: "G-1234567890",
  id: 1,
  languageCode: "en",
  sitemapUrl: "https://example.com/sitemap.xml",
  theme: "dark",
  timezone: "Asia/Shanghai",
  updatedAt: new Date("2026-04-10T00:00:00.000Z"),
};

function createRepositoryStub(overrides: Partial<SettingsRepository> = {}): SettingsRepository {
  return {
    createDefault: async () => baseSettingsRecord,
    find: async () => baseSettingsRecord,
    update: async (input) => ({
      ...baseSettingsRecord,
      ...input,
      commentSettings: {
        ...baseSettingsRecord.commentSettings,
        ...input.commentSettings,
      },
    }),
    ...overrides,
  };
}

describe("settings service", () => {
  test("creates default settings when singleton row does not exist", async () => {
    let defaultCreated = false;
    const service = createSettingsService(
      createRepositoryStub({
        createDefault: async () => {
          defaultCreated = true;

          return baseSettingsRecord;
        },
        find: async () => null,
      }),
    );

    const settings = await service.getSettings();

    expect(defaultCreated).toBe(true);
    expect(settings).toMatchObject({
      blogName: "SuperBlog",
      commentSettings: {
        enabled: true,
      },
    });
  });

  test("updates settings and returns dto", async () => {
    const service = createSettingsService(createRepositoryStub());

    const settings = await service.updateSettings({
      accentColor: "#22C55E",
      blogDescription: null,
      blogName: "Updated Blog",
      blogUrl: "https://updated.example.com",
      commentSettings: {
        allowAnonymous: true,
        enabled: false,
        maxReplyDepth: 5,
        moderationRequired: false,
        nestedRepliesEnabled: false,
      },
      contactEmail: null,
      defaultMetaDescription: null,
      defaultMetaTitle: null,
      fontFamily: null,
      googleAnalyticsId: null,
      languageCode: "zh-CN",
      sitemapUrl: null,
      theme: "system",
      timezone: "UTC",
    });

    expect(settings).toMatchObject({
      accentColor: "#22C55E",
      blogName: "Updated Blog",
      commentSettings: {
        allowAnonymous: true,
        enabled: false,
        maxReplyDepth: 5,
      },
      languageCode: "zh-CN",
    });
  });
});
