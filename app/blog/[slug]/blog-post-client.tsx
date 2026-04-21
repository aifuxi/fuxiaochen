"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowLeft, Calendar, Clock } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";

import { BlogComments } from "@/components/blog-comments";
import { SimilarPosts } from "@/components/similar-posts";
import { TableOfContents } from "@/components/table-of-contents";

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicBlog } from "@/lib/server/blogs/mappers";

function parseMarkdown(content: string): string {
  return content
    .replace(/^## (.+)$/gm, (_, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return `<h2 id="${id}" class="scroll-mt-24 text-2xl font-semibold mt-10 mb-4 text-foreground">${text}</h2>`;
    })
    .replace(/^### (.+)$/gm, (_, text) => {
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      return `<h3 id="${id}" class="scroll-mt-24 text-xl font-semibold mt-8 mb-3 text-foreground">${text}</h3>`;
    })
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>',
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(
      /^- (.+)$/gm,
      '<li class="ml-4 list-disc text-muted-foreground">$1</li>',
    )
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-4 space-y-2">$&</ul>')
    .replace(
      /^(?!<[hupol])(.+)$/gm,
      '<p class="text-muted-foreground leading-relaxed my-4">$1</p>',
    )
    .replace(/<p[^>]*>\s*<\/p>/g, "");
}

type BlogPostClientProps = {
  slug: string;
  initialPost?: PublicBlog;
  initialSimilarPosts?: PublicBlog[];
};

export function BlogPostClient({
  slug,
  initialPost,
  initialSimilarPosts,
}: BlogPostClientProps) {
  const { data: post, error } = useSWR<PublicBlog>(
    `/api/public/blogs/${slug}`,
    fetchApiData,
    {
      fallbackData: initialPost,
      revalidateOnFocus: false,
    },
  );
  const { data: similarResponse } = useSWR<{ items: PublicBlog[] }>(
    `/api/public/blogs/${slug}/similar?limit=3`,
    fetchApiData,
    {
      fallbackData: {
        items: initialSimilarPosts ?? [],
      },
      revalidateOnFocus: false,
    },
  );

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-foreground text-lg font-medium">Post not found.</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">Loading article...</p>
      </main>
    );
  }

  const htmlContent = parseMarkdown(post.content);

  return (
    <>
      <div className="relative h-[40vh] min-h-[300px] w-full md:h-[50vh]">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
        <div className="from-background via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      <main className="mx-auto max-w-4xl px-6">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground relative z-10 -mt-20 mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Blog
        </Link>

        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-muted-foreground text-sm">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-foreground mb-6 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {post.title}
          </h1>

          <p className="text-muted-foreground mb-6 text-lg">
            {post.description}
          </p>

          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readTime}
            </span>
          </div>
        </header>

        <div className="flex gap-12">
          <article
            className="prose-custom min-w-0 flex-1 pb-16"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <aside className="hidden w-56 shrink-0 lg:block">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        <BlogComments postSlug={slug} />
      </main>

      <SimilarPosts posts={similarResponse?.items ?? []} />
    </>
  );
}
