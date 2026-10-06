import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-origin";
import { writeTransaction } from "@/prisma/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await writeTransaction((tx) =>
    tx.orm.public.Post.where({ status: "published" })
      .select("slug", "updatedAt")
      .orderBy((post) => post.id.asc())
      .all(),
  );
  return [
    // 栏目没有独立修改时间，不伪造 lastmod；文章使用真实修改时间。
    ...["/", "/posts", "/categories", "/tags", "/changelog", "/friends-links", "/about"].map(
      (path) => ({ url: siteUrl(path) }),
    ),
    ...posts.map((post) => ({
      url: siteUrl(`/posts/${encodeURIComponent(post.slug)}`),
      lastModified: post.updatedAt,
    })),
  ];
}
