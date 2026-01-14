import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { format } from "date-fns";

import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";

import { getBlogDetail } from "@/api/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await getBlogDetail(slug);
    if (!blog) return { title: "Blog Not Found" };
    return {
      title: `${blog.title} | FuXiaochen`,
      description: blog.description || blog.title,
    };
  } catch (error) {
    return { title: "Blog Not Found" };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let blog;
  try {
    blog = await getBlogDetail(slug);
  } catch (error) {
    console.error("Failed to fetch blog detail:", error);
    notFound();
  }

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white font-body selection:bg-neon-magenta selection:text-black">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] pointer-events-none bg-[length:100%_2px,3px_100%] animate-scanline" />

      <main className="pt-24 pb-20 relative z-10">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] min-h-[400px] mb-12">
          <div className="absolute inset-0 bg-cyber-gray/50">
            {blog.cover ? (
              <Image
                src={blog.cover}
                alt={blog.title}
                fill
                className="object-cover opacity-60"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyber-gray to-black opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/80 to-transparent" />
          </div>

          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-20">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex gap-4 mb-6 flex-wrap">
                {blog.tags?.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="text-sm font-bold uppercase tracking-wider text-neon-cyan border border-neon-cyan/30 px-3 py-1 rounded bg-neon-cyan/5 backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                  >
                    {tag.name}
                  </span>
                ))}
                {blog.category && (
                  <span className="text-sm font-bold uppercase tracking-wider text-neon-purple border border-neon-purple/30 px-3 py-1 rounded bg-neon-purple/5 backdrop-blur-sm shadow-[0_0_10px_rgba(123,97,255,0.2)]">
                    {blog.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {blog.title}
              </h1>

              <div className="flex items-center gap-6 text-gray-400 font-mono text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-magenta animate-pulse" />
                  {blog.publishedAt
                    ? format(new Date(blog.publishedAt), "MMMM dd, yyyy")
                    : "Draft"}
                </span>
                {/* Reading time could be calculated if needed */}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div className="glass-panel p-8 md:p-12 rounded-2xl relative overflow-hidden h-fit">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta opacity-50" />

              <BlogContent content={blog.content} />

              {/* Footer / Navigation */}
              <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-neon-cyan transition-colors flex items-center gap-2 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">
                    ←
                  </span>{" "}
                  Back to Blog
                </Link>

                <div className="flex gap-4">
                  {/* Share buttons could go here */}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <TableOfContents />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
