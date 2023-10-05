import { PlusIcon } from 'lucide-react';

import {
  adminCreateTagAction,
  adminEditTagAction,
  adminGetTagsAction,
} from '@/app/_actions/tag';
import { Pagination } from '@/components/client/pagination/pagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEFAULT_PAGE } from '@/constants';
import { formatToDate } from '@/utils';

import CreateTagButton from './create-tag-button';
import DeleteTagItemButton from './delete-tag-item-button';
import EditTagButton from './edit-tag-button';

export default async function AdminTag({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const { tags, total } = await adminGetTagsAction({
    page: currentPage,
  });

  return (
    <div>
      <div className="flex justify-end">
        <CreateTagButton
          createTag={adminCreateTagAction}
          triggerNode={
            <Button size={'lg'}>
              <PlusIcon className="mr-2 h-4 w-4" />
              <span>创建标签</span>
            </Button>
          }
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">名称</TableHead>
            <TableHead className="w-[200px]">friendly_url</TableHead>
            <TableHead className="w-[200px]">文章数</TableHead>
            <TableHead className="w-[200px]">创建时间</TableHead>
            <TableHead className="w-[200px]">更新时间</TableHead>
            <TableHead className="w-min-[200px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags?.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="w-[200px]">{tag.name}</TableCell>
              <TableCell className="w-[200px]">{tag.friendlyUrl}</TableCell>
              <TableCell className="w-[200px]">
                {tag.articles?.length || 0}
              </TableCell>
              <TableCell className="w-[200px]">
                {formatToDate(new Date(tag.createdAt))}
              </TableCell>
              <TableCell className="w-[200px]">
                {formatToDate(new Date(tag.updatedAt))}
              </TableCell>
              <TableCell className="flex space-x-2 w-min-[200px]">
                <EditTagButton tag={tag} editTag={adminEditTagAction} />
                <DeleteTagItemButton tag={tag} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination total={total} />
    </div>
  );
}
