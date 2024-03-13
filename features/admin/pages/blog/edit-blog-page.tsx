import Link from 'next/link';

import { PATHS, PATHS_MAP } from '@/config';

import { EditBlogForm } from '../../components';

export const EditBlogPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href={PATHS.ADMIN_BLOG}>
          <h2 className="text-3xl font-semibold tracking-tight transition-colors text-foreground/80 hover:text-foreground ">
            {PATHS_MAP[PATHS.ADMIN_BLOG_EDIT]}
          </h2>
        </Link>

        <div>/</div>
        <h2 className="text-3xl font-semibold tracking-tight transition-colors">
          编辑Blog
        </h2>
      </div>

      <EditBlogForm />
    </div>
  );
};
