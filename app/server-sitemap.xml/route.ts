import { getServerSideSitemap, type ISitemapField } from "next-sitemap";

import { getAbsoluteSiteUrl } from "@/lib/env";
import { blogService } from "@/lib/server/blogs/service";

import { routes } from "@/constants/routes";

const toLastmod = (value: Date | string | null) => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export async function GET() {
  const posts = await blogService.listPublicBlogSitemapEntries();
  const fields: ISitemapField[] = posts.map((post) => ({
    loc: getAbsoluteSiteUrl(routes.site.blogPost(post.slug)),
    lastmod: toLastmod(post.updatedAt ?? post.publishedAt ?? post.createdAt),
  }));

  return getServerSideSitemap(fields);
}
