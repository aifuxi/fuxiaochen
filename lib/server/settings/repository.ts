import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  siteSettings,
  type NewSiteSettingsRow,
  type SiteSettingsRow,
} from "@/lib/db/schema";

import { SITE_SETTINGS_ID } from "./dto";

export interface SettingsRepository {
  findDefault(): Promise<SiteSettingsRow | null>;
  upsertDefault(
    settings: Omit<NewSiteSettingsRow, "id">,
  ): Promise<SiteSettingsRow>;
}

export const settingsRepository: SettingsRepository = {
  async findDefault() {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, SITE_SETTINGS_ID))
      .limit(1);

    return rows[0] ?? null;
  },
  async upsertDefault(settings) {
    const rows = await db
      .insert(siteSettings)
      .values({
        id: SITE_SETTINGS_ID,
        ...settings,
      })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: settings,
      })
      .returning();

    return rows[0]!;
  },
};
