import type { MetadataRoute } from "next";

import { asc, eq } from "drizzle-orm";

import { writeTransaction } from "@/lib/database";
import { post } from "@/lib/database/schema";
import { siteUrl } from "@/lib/site-origin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = writeTransaction((tx) =>
    tx
      .select({ slug: post.slug, updatedAt: post.updatedAt })
      .from(post)
      .where(eq(post.status, "published"))
      .orderBy(asc(post.id))
      .all(),
  );
  return [
    // 栏目没有独立修改时间，不伪造 lastmod；文章使用真实修改时间。
    ...["/", "/posts", "/categories", "/tags", "/changelog", "/friends-links", "/about"].map(
      (path) => ({ url: siteUrl(path) }),
    ),
    ...posts.flatMap((row) =>
      row.slug
        ? [
            {
              url: siteUrl(`/posts/${encodeURIComponent(row.slug)}`),
              lastModified: row.updatedAt,
            },
          ]
        : [],
    ),
  ];
}
