import "server-only";
import { connection } from "next/server";
import { cache } from "react";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin, AdminBusinessError } from "@/lib/admin/service";
import { MediaError } from "@/lib/media/error";
import { settingsReferenceUrls } from "@/lib/media/reference-urls";
import { ensureNewMediaReferences } from "@/lib/media/references";
import { writeTransaction, getDatabase } from "@/prisma/db";

import { defaultSettings, settingsSchema, type SettingsInput, type PublicSettings } from "./schema";

type Transaction = Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0];
async function read(tx: Transaction) {
  let row = await tx.orm.public.SiteSetting.where({ id: 1 }).first();
  if (!row) {
    const { socials: _socials, ...defaults } = defaultSettings;
    row = await tx.orm.public.SiteSetting.create({
      ...defaults,
      id: 1,
      enableComments: 1,
      localAnalyticsEnabled: 0,
      localAnalyticsStartedAt: null,
      googleEnabled: 0,
      baiduEnabled: 0,
      updatedAt: new Date(),
    });
  }
  const socials = await tx.orm.public.SocialAccount.where({ settingId: 1 })
    .orderBy([(s) => s.position.asc(), (s) => s.id.asc()])
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
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    return read(tx);
  });
}
export async function saveSettings(input: SettingsInput, actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    const previous = await read(tx);
    const { socials, version, ...fields } = input;
    try {
      await ensureNewMediaReferences(
        tx,
        settingsReferenceUrls(input),
        settingsReferenceUrls(previous),
      );
    } catch (error) {
      if (error instanceof MediaError) throw new AdminBusinessError("INVALID_INPUT", error.message);
      throw error;
    }
    const updated = await tx.orm.public.SiteSetting.where({ id: 1, version }).updateAndCount({
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
    });
    if (!updated)
      throw new AdminBusinessError(
        "VERSION_CONFLICT",
        "设置已被其他页面修改。草稿已保留，请重新载入后确认变更。",
      );
    await tx.orm.public.SocialAccount.where({ settingId: 1 }).deleteAndCount();
    for (const [position, social] of socials.entries())
      await tx.orm.public.SocialAccount.create({
        ...social,
        imageUrl: social.icon === "image" ? social.imageUrl : "",
        enabled: Number(social.enabled),
        position,
        settingId: 1,
      });
    return read(tx);
  });
}
// 仅请求内去重；不跨请求缓存数据库配置，也不在构建时固化。
export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  await connection();
  const settings = await writeTransaction(read);
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
