import { Badge } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';
import { GoBack } from '@/components/go-back';

import { NICKNAME } from '@/constants';
import { toFromNow } from '@/lib/utils';

import { type Blog } from '../types';

type BlogDetailProps = {
  blog: Blog;
};

export const BlogDetailPage = ({ blog }: BlogDetailProps) => {
  return (
    <div className="md:max-w-screen-md 2xl:max-w-6xl md:px-0 md:mx-auto py-12 md:py-24 grid gap-9 px-6">
      <article>
        {blog.cover && (
          <img
            src={blog.cover}
            alt={blog.title}
            className="max-w-screen-md 2xl:max-w-6xl h-auto mb-16 w-full"
          />
        )}
        <h1 className="mb-4 text-2xl md:text-4xl font-extrabold ">
          {blog.title}
        </h1>
        <div className="text-sm flex flex-row items-center text-muted-foreground">
          <div>{blog.author ? blog.author : NICKNAME}</div>
          <span className="mx-2">·</span>
          <span>发布于 {toFromNow(blog.createdAt)}</span>
        </div>
        <BytemdViewer body={blog.body || ''} />
      </article>

      <div className="flex flex-wrap gap-2">
        {blog.tags?.map((el) => (
          <Badge key={el.id} className="md:px-5 md:py-2 md:text-base">
            {el.name}
          </Badge>
        ))}
      </div>
      <GoBack />
    </div>
  );
};
