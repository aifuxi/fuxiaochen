import type { JSONContent } from "@tiptap/core";

import { readDocument } from "@/lib/posts/document";

export type ReferenceUrl = { field: string; url: string };
export function canonicalMediaUrl(value: string, origin: string | undefined) {
  if (!origin) return null;
  try {
    const url = new URL(value);
    if (url.origin !== new URL(origin).origin || url.username || url.password) return null;
    return (
      url.origin +
      url.pathname
        .split("/")
        .map((part) => encodeURIComponent(decodeURIComponent(part)))
        .join("/")
    );
  } catch {
    return null;
  }
}
export function documentReferenceUrls(content: string): ReferenceUrl[] {
  const result: ReferenceUrl[] = [];
  const visit = (node: JSONContent) => {
    if (node.type === "image" && typeof node.attrs?.src === "string")
      result.push({ field: "正文图片", url: node.attrs.src });
    for (const mark of node.marks ?? [])
      if (mark.type === "link" && typeof mark.attrs?.href === "string")
        result.push({ field: "正文链接", url: mark.attrs.href });
    node.content?.forEach(visit);
  };
  visit(readDocument(content));
  return result;
}
export function settingsReferenceUrls(settings: {
  avatarUrl: string;
  ogImageUrl?: string | null;
  icpUrl: string;
  policeUrl: string;
  socials: { id: string; url: string; imageUrl: string; icon: string }[];
}): ReferenceUrl[] {
  return [
    { field: "avatarUrl", url: settings.avatarUrl },
    { field: "ogImageUrl", url: settings.ogImageUrl ?? "" },
    { field: "icpUrl", url: settings.icpUrl },
    { field: "policeUrl", url: settings.policeUrl },
    ...settings.socials.flatMap((s) => [
      { field: `socials.${s.id}.url`, url: s.url },
      ...(s.icon === "image" ? [{ field: `socials.${s.id}.imageUrl`, url: s.imageUrl }] : []),
    ]),
  ];
}
export function friendReferenceUrls(friend: { url: string; avatar: string }): ReferenceUrl[] {
  return [
    { field: "url", url: friend.url },
    { field: "avatar", url: friend.avatar },
  ];
}
