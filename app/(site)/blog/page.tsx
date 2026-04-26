import { type Metadata } from "next";

import { settingsService } from "@/lib/server/settings/service";

import { BlogListClient } from "./blog-list-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await settingsService.getSettings();

  return settings.seo.pages.blog;
}

export default function BlogListPage() {
  return <BlogListClient />;
}
