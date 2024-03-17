import { Badge } from '@/components/ui/badge';

import { BytemdViewer } from '@/components/bytemd';
import { GoBack } from '@/components/go-back';

import { NICKNAME } from '@/constants';
import { toSimpleDateString } from '@/lib/utils';

import { type Blog } from '../types';

type BlogDetailProps = {
  blog: Blog;
};

export const BlogDetailPage = ({ blog }: BlogDetailProps) => {
  return (
    <div className="max-w-screen-md 2xl:max-w-6xl mx-auto pb-24 grid gap-9 px-6 pt-12">
      <article>
        {blog.cover && (
          <img
            src={blog.cover}
            alt={blog.title}
            className="max-w-screen-md 2xl:max-w-6xl h-auto mb-16 w-full"
          />
        )}
        <h1 className="mb-4 text-4xl font-extrabold ">{blog.title}</h1>
        <div className="text-sm flex flex-row items-center text-muted-foreground">
          <div>{blog.author ? blog.author : NICKNAME}</div>
          <span className="mx-2">·</span>
          <span>{toSimpleDateString(blog.createdAt)}</span>
        </div>
        <BytemdViewer body={blog.body || ''} />
      </article>

      <div className="flex flex-wrap gap-2">
        {blog.tags?.map((el) => (
          <Badge key={el.id} className="px-5 py-2 text-base">
            {el.name}
          </Badge>
        ))}
      </div>
      <GoBack />
    </div>
  );
};
