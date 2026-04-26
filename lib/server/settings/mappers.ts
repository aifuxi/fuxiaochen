import type { SiteSettingsRow } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/settings/types";

export type PublicSiteSettings = SiteSettings & {
  updatedAt?: string;
};

export type AdminSiteSettings = SiteSettings & {
  updatedAt?: string;
};

export function toPublicSiteSettings(
  settings: SiteSettings,
  row?: Pick<SiteSettingsRow, "updatedAt"> | null,
): PublicSiteSettings {
  return {
    ...settings,
    ...(row ? { updatedAt: row.updatedAt.toISOString() } : {}),
  };
}

export function toAdminSiteSettings(
  settings: SiteSettings,
  row?: Pick<SiteSettingsRow, "updatedAt"> | null,
): AdminSiteSettings {
  return {
    ...settings,
    ...(row ? { updatedAt: row.updatedAt.toISOString() } : {}),
  };
}
