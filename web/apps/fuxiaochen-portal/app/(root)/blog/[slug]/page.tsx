import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft02Icon,
  Calendar04Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { isNil } from "es-toolkit";

import { Badge } from "@/components/ui/badge";

import BytemdViewer from "@/components/bytemd";

import { getBlogDetail } from "@/api/blog";
import { PATHS } from "@/constants";
import { formattedDate } from "@/lib/common";
import { calculateReadTime } from "@/lib/common";

export const revalidate = 60;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const resp = await getBlogDetail(params.slug);
  const blog = resp.data;

  if (isNil(blog)) {
    return notFound();
  }

  const readMinutes = calculateReadTime(blog.content);

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-3xl">
        <Link
          href={PATHS.BLOGS}
          className={`
            mb-8 flex items-center gap-2 text-primary
            hover:underline
          `}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4" />
          返回博客列表
        </Link>
        <div>
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline">{blog?.category?.name}</Badge>
            </div>

            <h1 className="mb-4 text-4xl leading-tight font-bold">
              {blog.title}
            </h1>

            <p className="mb-6 text-lg text-muted-foreground">
              {blog.description}
            </p>

            <div
              className={`
                flex flex-wrap items-center gap-6 border-t border-b border-border py-4 text-sm text-muted-foreground
              `}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar04Icon} className="h-4 w-4" />
                <span>{formattedDate(new Date(blog.createdAt))}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
                <span>预计阅读 {readMinutes} 分钟</span>
              </div>
            </div>
          </header>

          <div className="my-8 leading-relaxed text-foreground">
            <BytemdViewer body={blog.content || ""} />
          </div>

          <footer className="mt-12 border-t border-border pt-8">
            <div className="flex flex-wrap gap-2">
              {blog?.tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="font-mono text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
