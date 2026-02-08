import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlugAction } from "@/app/actions/blog";
import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { formatDateWithTime } from "@/lib/time";

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
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <main className="relative z-10 pb-20">
        {/* Hero Section */}
        <div className="relative mb-12 h-[50vh] min-h-[400px] w-full pt-32">
          <div className="absolute inset-0">
            {blog.cover ? (
              <Image
                src={blog.cover}
                alt={blog.title}
                fill
                className="object-cover opacity-50"
                priority
              />
            ) : null}
          </div>

          <div className="relative z-20 container mx-auto flex h-full flex-col justify-end px-4 pb-12">
            <div className="mx-auto w-full max-w-4xl">
              <div className="mb-6 flex flex-wrap gap-4">
                {blog.tags?.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className={`
                      rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 text-sm
                      font-medium backdrop-blur-md
                    `}
                  >
                    {tag.name}
                  </span>
                ))}
                {blog.category && (
                  <span
                    className={`
                      rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-medium text-white shadow-md
                      backdrop-blur-md
                    `}
                  >
                    {blog.category.name}
                  </span>
                )}
              </div>

              <h1
                className={`
                  mb-6 text-4xl leading-tight font-bold text-[var(--text-color)] drop-shadow-sm
                  md:text-5xl
                  lg:text-6xl
                `}
              >
                {blog.title}
              </h1>

              <div className="flex items-center gap-6 text-sm text-[var(--text-color-secondary)]">
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent-color)]" />
                  {blog.publishedAt
                    ? formatDateWithTime(new Date(blog.publishedAt))
                    : "Draft"}
                </span>
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
                glass-panel relative h-fit overflow-hidden rounded-2xl border border-[var(--glass-border)]
                bg-[var(--glass-bg)] p-8
                md:p-12
              `}
            >
              <BlogContent content={blog.content} />

              {/* Footer / Navigation */}
              <div className="mt-16 flex items-center justify-between border-t border-[var(--glass-border)] pt-8">
                <Link
                  href="/blog"
                  className={`
                    group flex items-center gap-2 text-[var(--text-color-secondary)] transition-colors
                    hover:text-[var(--accent-color)]
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
                  返回博客列表
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
