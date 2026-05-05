import { unstable_cache } from "next/cache";

import type { SiteSettingsRow } from "@/lib/db/schema";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/defaults";
import {
  normalizeSiteSettingsTitles,
  normalizeTitleSeparator,
} from "@/lib/settings/title";
import type { SiteSettings } from "@/lib/settings/types";

import {
  adminSiteSettingsUpdateSchema,
  siteSettingsSchema,
  type AdminSiteSettingsUpdateInput,
} from "./dto";
import { settingsRepository, type SettingsRepository } from "./repository";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

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
): SiteSettings => {
  const settings = siteSettingsSchema.parse({
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

  return normalizeSiteSettingsTitles(settings);
};

const normalizeSettings = (row: SiteSettingsRow | null) => {
  const defaults = cloneDefaultSettings();

  if (!row) {
    return normalizeSiteSettingsTitles(defaults);
  }

  const candidate = {
    general: {
      ...defaults.general,
      ...row.general,
    },
    seo: {
      ...defaults.seo,
      ...row.seo,
      titleSeparator: normalizeTitleSeparator(row.seo.titleSeparator),
      pages: {
        ...defaults.seo.pages,
        ...row.seo.pages,
      },
    },
    profile: {
      ...defaults.profile,
      ...row.profile,
      skills: {
        ...defaults.profile.skills,
        ...row.profile.skills,
      },
    },
    social: {
      ...defaults.social,
      ...row.social,
    },
    compliance: {
      ...defaults.compliance,
      ...row.compliance,
    },
    analytics: {
      ...defaults.analytics,
      ...row.analytics,
      googleSearchConsole: {
        ...defaults.analytics.googleSearchConsole,
        ...row.analytics.googleSearchConsole,
      },
      googleAnalytics: {
        ...defaults.analytics.googleAnalytics,
        ...row.analytics.googleAnalytics,
      },
      umami: {
        ...defaults.analytics.umami,
        ...row.analytics.umami,
      },
    },
  };

  const parsed = siteSettingsSchema.safeParse({
    general: candidate.general,
    seo: candidate.seo,
    profile: candidate.profile,
    social: candidate.social,
    compliance: candidate.compliance,
    analytics: candidate.analytics,
  });

  return normalizeSiteSettingsTitles(parsed.success ? parsed.data : defaults);
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

export const getCachedSiteSettings = unstable_cache(
  () => settingsService.getSettings(),
  [SITE_SETTINGS_CACHE_TAG],
  {
    tags: [SITE_SETTINGS_CACHE_TAG],
  },
);
