import { IllustrationNoContent } from "@/components/illustrations";

import { BlogListItem } from "./blog-list-item";

import { type Blog } from "../types";

interface BlogListProps {
  blogs: Blog[];
}

export const BlogList = ({ blogs }: BlogListProps) => {
  if (!blogs.length) {
    return (
      <div className="grid place-content-center gap-8">
        <IllustrationNoContent className="size-[30vh]" />
        <h3 className="text-center text-2xl font-semibold tracking-tight">
          暂无Blog
        </h3>
      </div>
    );
  }

  return (
    <ul
      className={`
        grid grid-cols-1 gap-4 gap-y-8
        md:grid-cols-2
      `}
    >
      {blogs.map((el) => (
        <li key={el.id} className="">
          <BlogListItem blog={el} />
        </li>
      ))}
    </ul>
  );
};
