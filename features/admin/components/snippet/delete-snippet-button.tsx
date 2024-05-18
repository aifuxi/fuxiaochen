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
        <Button size={'icon'} variant="outline" onClick={() => setOpen(true)}>
          <Trash className="h-4 w-4 text-destructive" />
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
              <LoaderCircle className="mr-2 w-4 h-4 animate-spin" />
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
