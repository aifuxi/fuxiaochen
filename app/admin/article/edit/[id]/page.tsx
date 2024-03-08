import Link from 'next/link';

import { getArticle } from '@/app/actions/article';

import { PATHS } from '@/config';

import { getTags } from '@/features/tag';

import { EditForm } from './edit-form';

export default async function AdminArticleCreate({
  params,
}: {
  params: { id: string };
}) {
  const { tags } = await getTags();
  const article = await getArticle(params.id);

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
          编辑文章
        </h2>
      </div>

      <EditForm article={article ?? undefined} tags={tags} />
    </div>
  );
}
