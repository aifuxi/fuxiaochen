import Link from 'next/link';

import { PATHS, PATHS_MAP } from '@/config';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { EditBlogForm } from '../../components';

export const EditBlogPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.ADMIN_HOME}>{PATHS_MAP[PATHS.ADMIN_HOME]}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.ADMIN_BLOG}>{PATHS_MAP[PATHS.ADMIN_BLOG]}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{PATHS_MAP[PATHS.ADMIN_BLOG_EDIT]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-4xl md:text-5xl font-bold mb-2">
        {PATHS_MAP[PATHS.ADMIN_BLOG_EDIT]}
      </h2>
      <p className="text-lg text-muted-foreground">
        世界破破烂烂，Blog修修补补，好的文章总是需要反复打磨的
      </p>

      <EditBlogForm />
    </div>
  );
};
