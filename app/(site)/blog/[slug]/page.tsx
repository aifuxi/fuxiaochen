import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { BlogComments } from "@/components/blog-comments";
import { BlogCoverImage } from "@/components/blog-cover-image";
import { MarkdownPreview } from "@/components/markdown-preview";
import { SimilarPosts } from "@/components/similar-posts";
import { TableOfContents } from "@/components/table-of-contents";

import { blogService } from "@/lib/server/blogs/service";
import { AppError } from "@/lib/server/http/errors";
import { getCachedPublicBlogPostPageData } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

import { BlogPostLikeCta, BlogPostStatsClient } from "./blog-post-engagement";

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
  const pageData = await getBlogPostPageDataOrNotFound(slug);

  return <BlogPostPageContent pageData={pageData} slug={slug} />;
}

async function getBlogPostPageDataOrNotFound(slug: string) {
  try {
    return await getCachedPublicBlogPostPageData(slug);
  } catch (error) {
    if (
      (error instanceof AppError && error.status === 404) ||
      (typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 404)
    ) {
      notFound();
    }

    throw error;
  }
}

function BlogPostPageContent({
  pageData,
  slug,
}: {
  pageData: Awaited<ReturnType<typeof getCachedPublicBlogPostPageData>>;
  slug: string;
}) {
  const { comments, post, similarPosts } = pageData;

  return (
    <>
      <div className="relative h-[40vh] min-h-[300px] w-full md:h-[50vh]">
        <BlogCoverImage
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <main className="mx-auto max-w-4xl px-6">
        <Link
          href={routes.site.blog}
          className="relative z-10 -mt-20 mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {siteCopy.blogPost.backToBlog}
        </Link>

        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-sm text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="mb-6 text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
            {post.title}
          </h1>

          <p className="mb-6 text-lg text-muted-foreground">
            {post.description}
          </p>

          <BlogPostStatsClient initialPost={post} slug={slug} />
        </header>

        <div className="relative">
          <MarkdownPreview cacheKey={post.slug} content={post.content} />

          <aside className="absolute top-0 left-[calc(100%+2rem)] hidden h-full w-52 min-[1380px]:block 2xl:left-[calc(100%+3rem)] 2xl:w-56">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        <BlogPostLikeCta initialPost={post} slug={slug} />

        <BlogComments initialComments={comments} postSlug={post.slug} />
      </main>

      <SimilarPosts posts={similarPosts} />
    </>
  );
}
