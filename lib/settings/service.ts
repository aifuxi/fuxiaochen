import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin, AdminBusinessError } from "@/lib/admin/service";
import { writeTransaction, type DatabaseTransaction } from "@/lib/database";
import { siteSetting, socialAccount } from "@/lib/database/schema";
import { MediaError } from "@/lib/media/error";
import { settingsReferenceUrls } from "@/lib/media/reference-urls";
import { ensureNewMediaReferences } from "@/lib/media/references";

import { defaultSettings, settingsSchema, type SettingsInput, type PublicSettings } from "./schema";

function read(tx: DatabaseTransaction) {
  let row = tx.select().from(siteSetting).where(eq(siteSetting.id, 1)).get();
  if (!row) {
    const { socials: _socials, ...defaults } = defaultSettings;
    row = tx
      .insert(siteSetting)
      .values({
        ...defaults,
        id: 1,
        enableComments: 1,
        localAnalyticsEnabled: 0,
        localAnalyticsStartedAt: null,
        googleEnabled: 0,
        baiduEnabled: 0,
        updatedAt: new Date(),
      })
      .returning()
      .get();
  }
  const socials = tx
    .select()
    .from(socialAccount)
    .where(eq(socialAccount.settingId, 1))
    .orderBy(asc(socialAccount.position), asc(socialAccount.id))
    .all();
  const { id: _id, updatedAt, localAnalyticsStartedAt, ...fields } = row;
  return {
    ...settingsSchema.parse({
      ...fields,
      seoDescription: row.seoDescription ?? "",
      ogImageUrl: row.ogImageUrl ?? "",
      googleVerification: row.googleVerification ?? "",
      bingVerification: row.bingVerification ?? "",
      baiduVerification: row.baiduVerification ?? "",
      localAnalyticsEnabled: Boolean(row.localAnalyticsEnabled),
      enableComments: Boolean(row.enableComments),
      googleEnabled: Boolean(row.googleEnabled),
      baiduEnabled: Boolean(row.baiduEnabled),
      socials: socials.map(({ settingId: _setting, position: _position, ...social }) => ({
        ...social,
        enabled: Boolean(social.enabled),
      })),
    }),
    updatedAt: updatedAt.toISOString(),
    localAnalyticsStartedAt: localAnalyticsStartedAt?.toISOString() ?? null,
  };
}
export async function getSettings(actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor);
    return read(tx);
  });
}
export async function saveSettings(input: SettingsInput, actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor);
    const previous = read(tx);
    const { socials, version, ...fields } = input;
    try {
      ensureNewMediaReferences(tx, settingsReferenceUrls(input), settingsReferenceUrls(previous));
    } catch (error) {
      if (error instanceof MediaError) throw new AdminBusinessError("INVALID_INPUT", error.message);
      throw error;
    }
    const updated = tx
      .update(siteSetting)
      .set({
        ...fields,
        localAnalyticsEnabled: Number(input.localAnalyticsEnabled),
        localAnalyticsStartedAt: previous.localAnalyticsStartedAt
          ? new Date(previous.localAnalyticsStartedAt)
          : input.localAnalyticsEnabled
            ? new Date()
            : null,
        enableComments: Number(input.enableComments),
        googleEnabled: Number(input.googleEnabled),
        baiduEnabled: Number(input.baiduEnabled),
        updatedAt: new Date(),
        version: version + 1,
      })
      .where(and(eq(siteSetting.id, 1), eq(siteSetting.version, version)))
      .run();
    if (!updated.changes)
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "设置已被其他页面修改。草稿已保留，请重新载入后确认变更。",
      );
    tx.delete(socialAccount).where(eq(socialAccount.settingId, 1)).run();
    for (const [position, social] of socials.entries())
      tx.insert(socialAccount)
        .values({
          ...social,
          imageUrl: social.icon === "image" ? social.imageUrl : "",
          enabled: Number(social.enabled),
          position,
          settingId: 1,
        })
        .run();
    return read(tx);
  });
}
// 仅请求内去重；不跨请求缓存数据库配置，也不在构建时固化。
export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  await connection();
  const settings = writeTransaction(read);
  const {
    postsPerPage,
    enableComments,
    title,
    subtitle,
    seoDescription,
    ogImageUrl,
    googleVerification,
    bingVerification,
    baiduVerification,
    authorName,
    authorRole,
    avatarUrl,
    aboutMe,
    icpText,
    icpUrl,
    policeText,
    policeUrl,
    localAnalyticsEnabled,
    googleEnabled,
    googleId,
    baiduEnabled,
    baiduId,
  } = settings;
  return {
    postsPerPage,
    enableComments,
    title,
    subtitle,
    seoDescription,
    ogImageUrl,
    googleVerification,
    bingVerification,
    baiduVerification,
    authorName,
    authorRole,
    avatarUrl,
    aboutMe,
    icpText,
    icpUrl,
    policeText,
    policeUrl,
    localAnalyticsEnabled,
    googleEnabled,
    googleId: googleEnabled ? googleId : "",
    baiduEnabled,
    baiduId: baiduEnabled ? baiduId : "",
    socials: settings.socials.filter((s) => s.enabled),
  };
});
