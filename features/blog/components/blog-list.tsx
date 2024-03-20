import { IllustrationNoContent } from '@/components/illustrations';

import { BlogListItem } from './blog-list-item';

import { type Blog } from '../types';

type BlogListProps = {
  blogs: Blog[];
};

export const BlogList = ({ blogs }: BlogListProps) => {
  if (!blogs.length) {
    return (
      <div className="grid gap-8 place-content-center">
        <IllustrationNoContent className="w-[30vh] h-[30vh]" />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
          暂无Blog
        </h3>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
      {blogs.map((el, idx) => (
        <li
          key={el.id}
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${(idx + 1) * 200}ms`,
          }}
        >
          <BlogListItem blog={el} />
        </li>
      ))}
    </ul>
  );
};
