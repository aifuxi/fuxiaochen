'use client';

import * as React from 'react';

import { Loader2Icon, TrashIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useDeleteTag } from '@/features/tag';

type DeleteTagButtonProps = {
  id: string;
};

export const DeleteTagButton = ({ id }: DeleteTagButtonProps) => {
  const deleteTagQuery = useDeleteTag();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size={'icon'} variant="ghost">
              <TrashIcon size={16} className="text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>删除</TooltipContent>
        </Tooltip>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除标签</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该标签吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteTag}
            disabled={deleteTagQuery.isPending}
          >
            {deleteTagQuery.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDeleteTag() {
    await deleteTagQuery.mutateAsync(id);
  }
};
