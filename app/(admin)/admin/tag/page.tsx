import { getTags } from '@/app/actions/tag';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Pagination } from '@/components/pagination';

import { formatToDateTime } from '@/utils/time';

import { DEFAULT_PAGE } from '@/constants/unknown';

import { CreateTagButton } from './create-tag-button';
import { DeleteTagItemButton } from './delete-tag-item-button';
import { EditTagButton } from './edit-tag-button';

export default async function AdminTag({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const { tags, total } = await getTags({
    page: currentPage,
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        标签管理
      </h2>
      <div className="flex justify-end">
        <CreateTagButton />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>slug</TableHead>
            <TableHead>文章数</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags?.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="!align-middle">{tag.name}</TableCell>
              <TableCell className="!align-middle">{tag.slug}</TableCell>
              <TableCell className="!align-middle">
                {tag.articles?.length ?? 0}
              </TableCell>
              <TableCell className="!align-middle">
                {formatToDateTime(tag.createdAt)}
              </TableCell>
              <TableCell className="!align-middle">
                {formatToDateTime(tag.updatedAt)}
              </TableCell>
              <TableCell className="!align-middle !h-rx-9">
                <div className="flex gap-2 items-center">
                  <EditTagButton tag={tag} />
                  <DeleteTagItemButton tag={tag} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination total={total} />
    </div>
  );
}
