import { type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { UpdateSettingsInput } from "@/lib/settings/settings-dto";

const SETTINGS_ID = 1;

type CommentSettingsRecord = {
  allowAnonymous: boolean;
  enabled: boolean;
  maxReplyDepth: number;
  moderationRequired: boolean;
  nestedRepliesEnabled: boolean;
  updatedAt: Date;
};

type SettingsRecord = {
  accentColor: string | null;
  blogDescription: string | null;
  blogName: string;
  blogUrl: string;
  commentSettings: CommentSettingsRecord | null;
  contactEmail: string | null;
  createdAt: Date;
  defaultMetaDescription: string | null;
  defaultMetaTitle: string | null;
  fontFamily: string | null;
  googleAnalyticsId: string | null;
  id: number;
  languageCode: string;
  sitemapUrl: string | null;
  theme: string;
  timezone: string;
  updatedAt: Date;
};

export type SettingsRepository = {
  createDefault: () => Promise<SettingsRecord>;
  find: () => Promise<SettingsRecord | null>;
  update: (input: UpdateSettingsInput) => Promise<SettingsRecord>;
};

const commentSettingsSelect = {
  allowAnonymous: true,
  enabled: true,
  maxReplyDepth: true,
  moderationRequired: true,
  nestedRepliesEnabled: true,
  updatedAt: true,
} satisfies Prisma.CommentSettingSelect;

const settingsSelect = {
  accentColor: true,
  blogDescription: true,
  blogName: true,
  blogUrl: true,
  commentSettings: {
    select: commentSettingsSelect,
  },
  contactEmail: true,
  createdAt: true,
  defaultMetaDescription: true,
  defaultMetaTitle: true,
  fontFamily: true,
  googleAnalyticsId: true,
  id: true,
  languageCode: true,
  sitemapUrl: true,
  theme: true,
  timezone: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingSelect;

export function createSettingsRepository(database: PrismaClient = prisma): SettingsRepository {
  return {
    async createDefault() {
      return database.siteSetting.upsert({
        create: {
          blogDescription: "A calm editorial system for writing, publishing, and managing content.",
          blogName: "SuperBlog",
          blogUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          commentSettings: {
            create: {
              allowAnonymous: false,
              enabled: true,
              maxReplyDepth: 3,
              moderationRequired: true,
              nestedRepliesEnabled: true,
            },
          },
          id: SETTINGS_ID,
          languageCode: "en",
          theme: "dark",
          timezone: "Asia/Shanghai",
        },
        select: settingsSelect,
        update: {},
        where: {
          id: SETTINGS_ID,
        },
      });
    },
    async find() {
      return database.siteSetting.findUnique({
        select: settingsSelect,
        where: {
          id: SETTINGS_ID,
        },
      });
    },
    async update(input) {
      const { commentSettings, ...siteSettings } = input;

      return database.siteSetting.upsert({
        create: {
          ...siteSettings,
          commentSettings: {
            create: commentSettings,
          },
          id: SETTINGS_ID,
        },
        select: settingsSelect,
        update: {
          ...siteSettings,
          commentSettings: {
            upsert: {
              create: commentSettings,
              update: commentSettings,
            },
          },
        },
        where: {
          id: SETTINGS_ID,
        },
      });
    },
  };
}
