'use client';

import React from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import {
  IconMingcuteLoadingLine,
  IconSolarTrashBinMinimalistic2,
} from '@/components/icons';

import { useDeleteTag } from '@/features/tag';

type DeleteTagButtonProps = {
  id: string;
  refreshAsync: () => Promise<unknown>;
};

export const DeleteTagButton = ({ id, refreshAsync }: DeleteTagButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const deleteTagQuery = useDeleteTag();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={'icon'} variant="ghost" onClick={() => setOpen(true)}>
          <IconSolarTrashBinMinimalistic2 className="text-base text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除标签</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该标签吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <Button
            variant="outline"
            disabled={deleteTagQuery.loading}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button onClick={handleDeleteTag} disabled={deleteTagQuery.loading}>
            {deleteTagQuery.loading && (
              <IconMingcuteLoadingLine className="mr-2 text-base animate-spin" />
            )}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDeleteTag() {
    await deleteTagQuery.runAsync(id);
    setOpen(false);
    await refreshAsync();
  }
};
