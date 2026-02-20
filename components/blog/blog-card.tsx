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
      className={`
        group overflow-hidden rounded-2xl p-0 transition-all duration-300 ease-apple
        hover:-translate-y-0.5 hover:shadow-lg
      `}
    >
      <Link href={`/blog/${blog.slug}`} className="flex gap-4">
        {/* 封面图 */}
        {blog.cover && (
          <div
            className={`
              relative h-40 w-40 shrink-0 overflow-hidden
              sm:h-48 sm:w-48
            `}
          >
            <Image
              src={blog.cover}
              alt={blog.title}
              width={192}
              height={192}
              className={`
                h-full w-full object-cover transition-transform duration-500
                group-hover:scale-105
              `}
            />
          </div>
        )}

        {/* 内容区 */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* 标题 */}
          <h3
            className={`
              line-clamp-1 text-lg font-semibold text-text transition-colors
              group-hover:text-accent
            `}
          >
            {blog.title}
          </h3>

          {/* 描述 */}
          <Text type="secondary" className="line-clamp-2 text-sm">
            {blog.description}
          </Text>

          {/* 底部元信息 */}
          <div className="mt-auto flex flex-wrap items-center gap-2">
            {/* 分类 */}
            {blog.category && (
              <Badge variant="secondary" className="text-xs">
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
            <Text type="secondary" size="sm" className="ml-auto">
              {formatSimpleDate(new Date(blog.createdAt))}
            </Text>
          </div>
        </div>
      </Link>
    </Card>
  );
}
