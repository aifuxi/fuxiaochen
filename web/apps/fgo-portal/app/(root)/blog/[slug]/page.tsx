import Link from "next/link";
import { notFound } from "next/navigation";

import { isNil } from "es-toolkit";
import { Calendar, Clock, InboxIcon, TagIcon } from "lucide-react";

import BytemdViewer from "@/components/bytemd";

import { getBlogDetail } from "@/api/blog";
import { PATHS } from "@/constants";
import { calculateReadTime, checkUpdate, toSlashDate } from "@/lib/common";

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
  const showUpdate = checkUpdate({
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  });

  return (
    <div
      className={`
        mx-auto flex max-w-prose-wrapper flex-col gap-4 pt-32
        md:!px-0
      `}
    >
      <h1 className="text-center text-2xl font-semibold break-all">
        {blog.title}
      </h1>

      <div className="flex justify-center gap-4 text-sm text-muted-foreground">
        {blog.category && (
          <Link
            className={`
              flex items-center gap-1 transition-all
              hover:font-medium hover:text-primary
            `}
            href={`${PATHS.CATEGORY}/${blog?.category?.slug}`}
          >
            <InboxIcon className="size-4" />
            <span>{blog?.category?.name}</span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="size-4" />
          <span>{toSlashDate(blog.createdAt)}</span>
          {showUpdate && <span>（更新于{toSlashDate(blog.updatedAt)}）</span>}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-4" />
          预计阅读时长 {readMinutes} 分钟
        </div>
      </div>

      <blockquote className="mt-6 mb-8 border-l-2 pl-6 text-sm text-muted-foreground">
        {blog.description}
      </blockquote>

      <BytemdViewer body={blog.content || ""} />

      <ul className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {blog?.tags?.map((tag) => (
          <li key={tag.id} className="flex items-center gap-1">
            <Link
              className={`
                flex items-center gap-1 transition-all
                hover:font-medium hover:text-primary
              `}
              href={`${PATHS.TAG}/${tag?.slug}`}
            >
              <TagIcon className="size-3" />
              <span>{tag.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
