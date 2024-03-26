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

import { useDeleteSnippet } from '@/features/snippet';

type DeleteSnippetButtonProps = {
  id: string;
  refreshAsync: () => Promise<unknown>;
};

export const DeleteSnippetButton = ({
  id,
  refreshAsync,
}: DeleteSnippetButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const deleteSnippetQuery = useDeleteSnippet();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={'icon'} variant="ghost" onClick={() => setOpen(true)}>
          <IconSolarTrashBinMinimalistic2 className="text-destructive text-base" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除片段</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该片段吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <Button
            variant="outline"
            disabled={deleteSnippetQuery.loading}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button onClick={handleDelete} disabled={deleteSnippetQuery.loading}>
            {deleteSnippetQuery.loading && (
              <IconMingcuteLoadingLine className="mr-2 text-base animate-spin" />
            )}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDelete() {
    await deleteSnippetQuery.runAsync(id);
    setOpen(false);
    await refreshAsync();
  }
};
