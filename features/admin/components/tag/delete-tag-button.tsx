'use client';

import React from 'react';

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

import {
  IconSolarRestart,
  IconSolarTrashBinMinimalistic2,
} from '@/components/icons';

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
              <IconSolarTrashBinMinimalistic2 className="text-base text-destructive" />
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
              <IconSolarRestart className="mr-2 text-base animate-spin" />
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
