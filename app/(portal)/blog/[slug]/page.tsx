import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getBlogBySlugAction } from "@/app/actions/blog";
import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: blog } = await getBlogBySlugAction(slug);
    if (!blog) return { title: "未找到博客" };
    return {
      title: `${blog.title} | FuXiaochen`,
      description: blog.description || blog.title,
    };
  } catch (_error) {
    return { title: "未找到博客" };
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
    const { data } = await getBlogBySlugAction(slug);
    blog = data;
  } catch (error) {
    console.error("Failed to fetch blog detail:", error);
    notFound();
  }

  if (!blog) {
    notFound();
  }

  return (
    <div
      className={`
        min-h-screen bg-cyber-black font-body text-white
        selection:bg-neon-magenta selection:text-black
      `}
    >
      <main className="relative z-10 pb-20">
        {/* Hero Section */}
        <div className="relative mb-12 h-[50vh] min-h-[400px] w-full pt-32">
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
              <div className="h-full w-full bg-gradient-to-br from-cyber-gray to-black opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/80 to-transparent" />
          </div>

          <div className="relative z-20 container mx-auto flex h-full flex-col justify-end px-4 pb-12">
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-6 flex flex-wrap gap-4">
                {blog.tags?.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className={`
                      rounded border border-neon-cyan/30 bg-neon-cyan/5 px-3 py-1 text-sm font-bold tracking-wider
                      text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)] backdrop-blur-sm
                    `}
                  >
                    {tag.name}
                  </span>
                ))}
                {blog.category && (
                  <span
                    className={`
                      rounded border border-neon-purple/30 bg-neon-purple/5 px-3 py-1 text-sm font-bold tracking-wider
                      text-neon-purple shadow-[0_0_10px_rgba(123,97,255,0.2)] backdrop-blur-sm
                    `}
                  >
                    {blog.category.name}
                  </span>
                )}
              </div>

              <h1
                className={`
                  mb-6 font-display text-4xl leading-tight font-bold text-white
                  drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]
                  md:text-5xl
                  lg:text-6xl
                `}
              >
                {blog.title}
              </h1>

              <div className="flex items-center gap-6 font-mono text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-neon-magenta" />
                  {blog.publishedAt
                    ? format(new Date(blog.publishedAt), "yyyy 年 MM 月 dd 日")
                    : "草稿"}
                </span>
                {/* Reading time could be calculated if needed */}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4">
          <div
            className={`
              grid grid-cols-1 gap-8
              lg:grid-cols-[1fr_300px]
            `}
          >
            <div
              className={`
                glass-panel relative h-fit overflow-hidden rounded-md p-8
                md:p-12
              `}
            >
              <div
                className={`
                  absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta
                  opacity-50
                `}
              />

              <BlogContent content={blog.content} />

              {/* Footer / Navigation */}
              <div className="mt-16 flex items-center justify-between border-t border-white/10 pt-8">
                <Link
                  href="/blog"
                  className={`
                    group flex items-center gap-2 text-gray-400 transition-colors
                    hover:text-neon-cyan
                  `}
                >
                  <span
                    className={`
                      transition-transform
                      group-hover:-translate-x-1
                    `}
                  >
                    ←
                  </span>{" "}
                  返回博客
                </Link>

                <div className="flex gap-4">
                  {/* Share buttons could go here */}
                </div>
              </div>
            </div>

            <div
              className={`
                hidden
                lg:block
              `}
            >
              <TableOfContents />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
