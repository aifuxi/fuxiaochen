import { BytemdViewer } from "@/components/bytemd";
import { Wrapper } from "@/components/wrapper";

import { TagList } from "@/features/tag";
import { prettyDateWithWeekday } from "@/lib/utils";

import { type Blog } from "../types";

type BlogDetailProps = {
  blog: Blog;
};

export const BlogDetailPage = ({ blog }: BlogDetailProps) => {
  return (
    <Wrapper className="mx-auto flex !max-w-detail-content flex-col pt-8 md:!px-0">
      <h1 className="mb-6 break-all text-4xl font-semibold">{blog.title}</h1>

      <p className="mb-6 text-neutral-500">{blog.description}</p>
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        <p>发布于&nbsp;&nbsp;{prettyDateWithWeekday(blog.createdAt)}</p>
      </div>

      <BytemdViewer body={blog.body || ""} />

      <div className="pb-14 pt-16">
        <TagList tags={blog.tags} />
      </div>
    </Wrapper>
  );
};
