import Link from 'next/link';

import { MoveLeft } from 'lucide-react';

import { BytemdViewer } from '@/components/bytemd';
import { DetailSidebar } from '@/components/detail-sidebar';
import { MarkdownTOC } from '@/components/markdown-toc';
import { Wrapper } from '@/components/wrapper';

import { PATHS, PLACEHOLDER_TEXT } from '@/constants';
import { TagList } from '@/features/tag';
import { cn, prettyDateWithWeekday } from '@/lib/utils';

import { BlogEventTracking } from '../components/blog-event-tracking';
import { type Blog } from '../types';

type BlogDetailProps = {
  blog: Blog;
  uv?: number;
};

export const BlogDetailPage = ({ blog, uv = 0 }: BlogDetailProps) => {
  return (
    <Wrapper className="flex flex-col pt-8">
      <div>
        <Link
          href={PATHS.SITE_BLOG}
          className={cn(
            'text-sm flex items-center space-x-1 transition-colors py-2',
            'text-muted-foreground hover:text-primary',
          )}
        >
          <MoveLeft className="w-3.5 h-3.5" />
          <span>返回博客</span>
        </Link>
      </div>
      <div className="text-muted-foreground flex items-center space-x-4 pt-8 pb-4 text-sm">
        <p>发布于&nbsp;&nbsp;{prettyDateWithWeekday(blog.createdAt)}</p>
        <p>{uv || PLACEHOLDER_TEXT}&nbsp;&nbsp;人浏览过</p>
      </div>
      <h1 className="break-all py-6 text-4xl font-semibold">{blog.title}</h1>

      <p className="text-neutral-500 py-4">{blog.description}</p>

      <div className="flex">
        <div
          className={cn(
            'flex-1 pr-14',
            'wrapper:border-r wrapper:border-r-border',
          )}
        >
          <BytemdViewer body={blog.body || ''} />
        </div>
        <DetailSidebar>
          <MarkdownTOC />
        </DetailSidebar>
      </div>

      <div className="pt-16 pb-14">
        <TagList tags={blog.tags} />
      </div>
      <BlogEventTracking blogID={blog.id} />
    </Wrapper>
  );
};
