import { BytemdViewer } from "@/components/bytemd";

import { TagList } from "@/features/tag";
import { prettyDateWithWeekday } from "@/lib/common";

import { type Blog } from "../types";

interface BlogDetailProps {
  blog: Blog;
}

export const BlogDetailPage = ({ blog }: BlogDetailProps) => {
  return (
    <div
      className={`
        mx-auto flex max-w-prose-wrapper flex-col pt-8
        md:!px-0
      `}
    >
      <h1 className="mb-6 text-4xl font-semibold break-all">{blog.title}</h1>

      <p className="mb-6 text-muted-foreground">{blog.description}</p>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <p>发布于&nbsp;&nbsp;{prettyDateWithWeekday(blog.createdAt)}</p>
      </div>

      <BytemdViewer body={blog.body || ""} />

      <div className="pt-16 pb-14">
        <TagList tags={blog.tags} />
      </div>
    </div>
  );
};
