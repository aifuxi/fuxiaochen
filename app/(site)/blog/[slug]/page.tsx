import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlugAction } from "@/app/actions/blog";
import { Badge } from "@/components/ui/badge";
import { Title } from "@/components/ui/typography/title";
import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { formatSimpleDate } from "@/lib/time";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 生成 SEO 元数据
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    return {
      title: "博客未找到",
    };
  }

  const blog = result.data;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      images: blog.cover ? [blog.cover] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const blog = result.data;

  // 计算阅读时间（假设每分钟阅读 300 字）
  const readingTime = Math.max(1, Math.ceil(blog.content.length / 300));

  return (
    <div className="container-shell max-w-6xl py-12">
      {/* 返回链接 */}
      <Link
        href="/blog"
        className={`
          mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors
          hover:text-primary
        `}
      >
        ← 返回博客列表
      </Link>

      <div className="flex gap-10">
        {/* 主内容区 */}
        <article className="min-w-0 flex-1">
          {/* 封面图 */}
          {blog.cover && (
            <div className="mb-10 aspect-[16/9] w-full overflow-hidden rounded-md border border-white/10">
              <Image
                src={blog.cover}
                alt={blog.title}
                width={1200}
                height={630}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          )}

          {/* 文章头部 */}
          <header className="mb-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {blog.category && (
                <Badge variant="success">{blog.category.name}</Badge>
              )}
              <span className="text-label text-muted-foreground">Article</span>
            </div>

            <Title level={1} className={`
              mb-5 text-5xl
              md:text-6xl
            `}>
              {blog.title}
            </Title>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <time className="font-mono">
                {formatSimpleDate(new Date(blog.createdAt))}
              </time>
              <span>·</span>
              <span>{readingTime} 分钟阅读</span>
            </div>
          </header>

          {/* 分隔线 */}
          <div className="mb-8 h-px bg-border" />

          {/* 文章内容 */}
          <BlogContent content={blog.content} />

          {/* 标签 */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* 右侧目录（桌面端显示） */}
        <aside
          className={`
            hidden w-72 shrink-0
            lg:block
          `}
        >
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
