'use client';

import React from 'react';

import { LoaderCircle, Trash } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

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
          <Trash className="h-4 w-4 text-destructive" />
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
              <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
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
