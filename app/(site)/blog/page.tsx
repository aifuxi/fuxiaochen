import { type Metadata } from "next";

import { getCachedPublicBlogPageData } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { BlogListClient } from "./blog-list-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.blog;
}

export default async function BlogListPage() {
  const { items, categories, tags } = await getCachedPublicBlogPageData();

  return (
    <BlogListClient
      initialBlogs={items}
      initialCategories={categories}
      initialTags={tags}
    />
  );
}
