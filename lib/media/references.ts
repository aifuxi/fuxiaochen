import "server-only";
import { createHash } from "node:crypto";

import type { DatabaseTransaction } from "@/prisma/db";

import type { MediaReferences } from "./schema";

import { MediaError } from "./error";
import {
  canonicalMediaUrl,
  documentReferenceUrls,
  friendReferenceUrls,
  settingsReferenceUrls,
  type ReferenceUrl,
} from "./reference-urls";
import { publicMediaUrl } from "./storage";

export async function findMediaReferences(
  tx: DatabaseTransaction,
  objectKey: string,
): Promise<MediaReferences> {
  const target = canonicalMediaUrl(publicMediaUrl(objectKey), process.env.OSS_PUBLIC_ORIGIN);
  const items: MediaReferences["items"] = [];
  const add = (kind: string, id: string, label: string, href: string, urls: ReferenceUrl[]) => {
    for (const ref of urls) {
      if (canonicalMediaUrl(ref.url, process.env.OSS_PUBLIC_ORIGIN) !== target) continue;
      const existing = items.find(
        (item) => item.kind === kind && item.id === id && item.field === ref.field,
      );
      if (existing) existing.occurrences++;
      else items.push({ kind, id, label, href, field: ref.field, occurrences: 1 });
    }
  };
  const posts = await tx.orm.public.Post.select("id", "title", "content").all();
  for (const post of posts)
    add(
      "post",
      post.id,
      post.title,
      `/admin/posts/${post.id}/edit`,
      documentReferenceUrls(post.content),
    );
  const setting = await tx.orm.public.SiteSetting.where({ id: 1 }).first();
  if (setting) {
    const socials = await tx.orm.public.SocialAccount.where({ settingId: 1 }).all();
    add(
      "settings",
      "1",
      "站点设置与社交账号",
      "/admin/settings",
      settingsReferenceUrls({ ...setting, socials }),
    );
  }
  for (const friend of await tx.orm.public.FriendLink.all())
    add(
      "friend",
      friend.id,
      friend.name,
      `/admin/friends-links?record=${friend.id}`,
      friendReferenceUrls(friend),
    );
  items.sort((a, b) =>
    `${a.kind}:${a.id}:${a.field}`.localeCompare(`${b.kind}:${b.id}:${b.field}`),
  );
  return {
    items,
    count: items.reduce((sum, item) => sum + item.occurrences, 0),
    fingerprint: createHash("sha256").update(JSON.stringify(items)).digest("hex"),
  };
}

// 调用方必须位于共享写锁事务内；只校验新增引用，允许强删后保留旧的失效链接。
export async function ensureNewMediaReferences(
  tx: DatabaseTransaction,
  next: ReferenceUrl[],
  previous: ReferenceUrl[] = [],
) {
  const origin = process.env.OSS_PUBLIC_ORIGIN;
  const counts = new Map<string, number>();
  for (const ref of previous) {
    const url = canonicalMediaUrl(ref.url, origin);
    if (url) {
      const key = `${ref.field}:${url}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (const ref of next) {
    const url = canonicalMediaUrl(ref.url, origin);
    if (!url) continue;
    const key = `${ref.field}:${url}`;
    const count = counts.get(key) ?? 0;
    if (count) {
      counts.set(key, count - 1);
      continue;
    }
    const objectKey = decodeURIComponent(new URL(url).pathname.slice(1));
    if (!objectKey.startsWith("media/")) continue;
    const media = await tx.orm.public.Media.where({ objectKey }).select("status").first();
    if (!media || media.status !== "ready")
      throw new MediaError("RESOURCE_IN_USE", "引用的媒体正在删除或已不可用，请重新选择媒体。");
  }
}
