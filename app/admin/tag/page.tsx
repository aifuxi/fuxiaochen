import { Button, Table } from '@radix-ui/themes';
import { PlusIcon } from 'lucide-react';

import CreateTagButton from './create-tag-button';
import DeleteTagItemButton from './delete-tag-item-button';
import EditTagButton from './edit-tag-button';
import {
  adminCreateTagAction,
  adminEditTagAction,
  adminGetTagsAction,
} from '@/app/_actions/tag';
import { Pagination } from '@/components/client/pagination/pagination';
import { DEFAULT_PAGE } from '@/constants';
import { formatToDate } from '@/utils';

export default async function AdminTag({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
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
            <Button size={'2'} className="bg-accent-9">
              <PlusIcon className="mr-2 h-4 w-4" />
              <span>创建标签</span>
            </Button>
          }
        />
      </div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className="w-[200px]">
              名称
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              friendly_url
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              文章数
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              创建时间
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              更新时间
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-min-[200px]">
              操作
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tags?.map((tag) => (
            <Table.Row key={tag.id}>
              <Table.Cell className="w-[200px]">{tag.name}</Table.Cell>
              <Table.Cell className="w-[200px]">{tag.friendlyUrl}</Table.Cell>
              <Table.Cell className="w-[200px]">
                {tag.articles?.length ?? 0}
              </Table.Cell>
              <Table.Cell className="w-[200px]">
                {formatToDate(new Date(tag.createdAt))}
              </Table.Cell>
              <Table.Cell className="w-[200px]">
                {formatToDate(new Date(tag.updatedAt))}
              </Table.Cell>
              <Table.Cell className="flex space-x-2 w-min-[200px]">
                <EditTagButton tag={tag} editTag={adminEditTagAction} />
                <DeleteTagItemButton tag={tag} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Pagination total={total} />
    </div>
  );
}
