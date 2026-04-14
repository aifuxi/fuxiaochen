import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/typography/text";
import { formatSimpleDate } from "@/lib/time";

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card
      variant="article"
      className={`
        group overflow-hidden p-0
        hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg
      `}
    >
      <Link
        href={`/blog/${blog.slug}`}
        className={`
          flex flex-col gap-0
          md:flex-row
        `}
      >
        {/* 封面图 */}
        {blog.cover && (
          <div
            className={`
              relative aspect-[16/10] shrink-0 overflow-hidden
              md:h-auto md:w-60
            `}
          >
            <Image
              src={blog.cover}
              alt={blog.title}
              fill
              sizes="(min-width: 768px) 240px, 100vw"
              className={`
                h-full w-full object-cover transition-transform duration-500
                group-hover:scale-105
              `}
            />
          </div>
        )}

        {/* 内容区 */}
        <div className={`
          flex flex-1 flex-col gap-3 p-5
          md:p-6
        `}>
          {/* 标题 */}
          <h3
            className={`
              line-clamp-2 font-serif text-2xl text-foreground transition-colors
              group-hover:text-primary
            `}
          >
            {blog.title}
          </h3>

          {/* 描述 */}
          <Text type="secondary" className="line-clamp-3 text-sm leading-6">
            {blog.description}
          </Text>

          {/* 底部元信息 */}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {/* 分类 */}
            {blog.category && (
              <Badge variant="success" className="text-xs">
                {blog.category.name}
              </Badge>
            )}

            {/* 标签 */}
            {blog.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}

            {/* 时间 */}
            <Text type="secondary" size="sm" className="ml-auto font-mono">
              {formatSimpleDate(new Date(blog.createdAt))}
            </Text>
          </div>
        </div>
      </Link>
    </Card>
  );
}
