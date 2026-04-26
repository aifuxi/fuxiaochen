import type { SiteSettingsRow } from "@/lib/db/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/defaults";
import type { SiteSettings } from "@/lib/settings/types";

import {
  adminSiteSettingsUpdateSchema,
  siteSettingsSchema,
  type AdminSiteSettingsUpdateInput,
} from "./dto";
import { settingsRepository, type SettingsRepository } from "./repository";

export interface SettingsService {
  getSettings(): Promise<{
    settings: SiteSettings;
    row: SiteSettingsRow | null;
  }>;
  updateSettings(input: AdminSiteSettingsUpdateInput): Promise<{
    settings: SiteSettings;
    row: SiteSettingsRow;
  }>;
}

export interface SettingsServiceDeps {
  repository?: SettingsRepository;
  now?: () => Date;
}

const cloneDefaultSettings = () => structuredClone(DEFAULT_SITE_SETTINGS);

const mergeSettings = (
  current: SiteSettings,
  input: AdminSiteSettingsUpdateInput,
): SiteSettings =>
  siteSettingsSchema.parse({
    general: {
      ...current.general,
      ...input.general,
    },
    seo: {
      ...current.seo,
      ...input.seo,
      pages: {
        ...current.seo.pages,
        ...input.seo?.pages,
      },
    },
    profile: {
      ...current.profile,
      ...input.profile,
      skills: {
        ...current.profile.skills,
        ...input.profile?.skills,
      },
    },
    social: {
      ...current.social,
      ...input.social,
    },
    compliance: {
      ...current.compliance,
      ...input.compliance,
    },
    analytics: {
      ...current.analytics,
      ...input.analytics,
      googleSearchConsole: {
        ...current.analytics.googleSearchConsole,
        ...input.analytics?.googleSearchConsole,
      },
      googleAnalytics: {
        ...current.analytics.googleAnalytics,
        ...input.analytics?.googleAnalytics,
      },
      umami: {
        ...current.analytics.umami,
        ...input.analytics?.umami,
      },
    },
  });

const normalizeSettings = (row: SiteSettingsRow | null) => {
  if (!row) {
    return cloneDefaultSettings();
  }

  const parsed = siteSettingsSchema.safeParse({
    general: row.general,
    seo: row.seo,
    profile: row.profile,
    social: row.social,
    compliance: row.compliance,
    analytics: row.analytics,
  });

  return parsed.success ? parsed.data : cloneDefaultSettings();
};

export function createSettingsService({
  repository = settingsRepository,
  now = () => new Date(),
}: SettingsServiceDeps = {}): SettingsService {
  return {
    async getSettings() {
      const row = await repository.findDefault().catch(() => null);

      return {
        settings: normalizeSettings(row),
        row,
      };
    },
    async updateSettings(input) {
      const parsedInput = adminSiteSettingsUpdateSchema.parse(input);
      const currentRow = await repository.findDefault();
      const settings = mergeSettings(
        normalizeSettings(currentRow),
        parsedInput,
      );
      const row = await repository.upsertDefault({
        ...settings,
        updatedAt: now(),
      });

      return {
        settings,
        row,
      };
    },
  };
}

export const settingsService = createSettingsService();
