import { getServerSideSitemap, type ISitemapField } from "next-sitemap";

import { blogService } from "@/lib/server/blogs/service";
import { getAbsoluteSiteUrl } from "@/lib/site-url.cjs";

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
