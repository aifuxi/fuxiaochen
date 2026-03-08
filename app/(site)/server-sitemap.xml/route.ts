import { type ISitemapField, getServerSideSitemap } from "next-sitemap";
import { getBlogsAction } from "@/app/actions/blog";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL 未配置");
  }

  const pageSize = 1000;
  const blogs: { slug: string; updatedAt: string }[] = [];
  let page = 1;

  while (true) {
    const res = await getBlogsAction({
      page,
      pageSize,
      published: true,
      sortBy: "updatedAt",
      order: "desc",
    });

    if (!res.success || !res.data) {
      throw new Error(res.error || "生成 sitemap 失败");
    }

    const lists = res.data.lists || [];
    blogs.push(...lists);

    if (lists.length < pageSize) break;
    page += 1;
  }

  const blogsSitemaps = blogs.map((item): ISitemapField => {
    const loc = new URL(`/blog/${item.slug}`, siteUrl).toString();
    return {
      loc,
      lastmod: new Date(item.updatedAt).toISOString(),
      changefreq: "hourly",
    };
  });

  return getServerSideSitemap([...blogsSitemaps]);
}
