import Link from 'next/link';

import { getAllTags } from '@/app/actions/tag';

import { PATHS } from '@/config';

import { CreateForm } from './create-form';

export default async function AdminArticleCreate() {
  const tags = await getAllTags();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href={PATHS.ADMIN_ARTICLE}>
          <h2 className="text-3xl font-semibold tracking-tight transition-colors text-foreground/80 hover:text-foreground ">
            文章管理
          </h2>
        </Link>

        <div>/</div>
        <h2 className="text-3xl font-semibold tracking-tight transition-colors">
          创建文章
        </h2>
      </div>

      <CreateForm tags={tags} />
    </div>
  );
}
