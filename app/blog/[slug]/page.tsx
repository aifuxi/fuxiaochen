import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, Calendar, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { BlogComments } from "@/components/blog-comments";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SimilarPosts } from "@/components/similar-posts";
import { TableOfContents } from "@/components/table-of-contents";

import { getPostBySlug, getSimilarPosts, blogPosts } from "@/lib/blog-data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Fuxiaochen`,
    description: post.description,
  };
}

function parseMarkdown(content: string): string {
  return (
    content
      // Headers with IDs for TOC linking
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
      // Code blocks
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>',
      )
      // Inline code
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
      )
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Lists
      .replace(
        /^- (.+)$/gm,
        '<li class="ml-4 list-disc text-muted-foreground">$1</li>',
      )
      // Wrap consecutive list items
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-4 space-y-2">$&</ul>')
      // Paragraphs
      .replace(
        /^(?!<[hupol])(.+)$/gm,
        '<p class="text-muted-foreground leading-relaxed my-4">$1</p>',
      )
      // Clean up empty paragraphs
      .replace(/<p[^>]*>\s*<\/p>/g, "")
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const similarPosts = getSimilarPosts(slug, 3);
  const htmlContent = parseMarkdown(post.content);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* Cover Image */}
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
        {/* Back link */}
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground relative z-10 -mt-20 mb-8 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
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

        {/* Content with TOC */}
        <div className="flex gap-12">
          {/* Main Content */}
          <article
            className="prose-custom min-w-0 flex-1 pb-16"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Table of Contents - Desktop */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        {/* Comments Section */}
        <BlogComments postSlug={slug} />
      </main>

      {/* Similar Posts */}
      <SimilarPosts posts={similarPosts} />

      <Footer />
    </div>
  );
}
