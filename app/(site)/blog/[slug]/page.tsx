import { blogService } from "@/lib/server/blogs/service";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { BlogPostClient } from "./blog-post-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { settings } = await getCachedSiteSettings();

  try {
    const blog = await blogService.getPublicBlogBySlug(slug);

    return {
      title: `${blog.title} | ${settings.general.siteName}`,
      description: blog.description,
    };
  } catch {
    const readableSlug = slug
      .split("-")
      .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
      .join(" ");

    return {
      title: `${readableSlug} | ${settings.general.siteName}`,
      description: `阅读 ${settings.general.siteName} 上的《${readableSlug}》。`,
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <BlogPostClient slug={slug} />;
}
