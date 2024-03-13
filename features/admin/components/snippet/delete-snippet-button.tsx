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

import { IconSolarTrashBinMinimalistic2 } from '@/components/icons';

import { useDeleteSnippet } from '@/features/snippet';

type DeleteSnippetButtonProps = {
  id: string;
};

export const DeleteSnippetButton = ({ id }: DeleteSnippetButtonProps) => {
  const deleteSnippetQuery = useDeleteSnippet();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size={'icon'} variant="ghost">
              <IconSolarTrashBinMinimalistic2 className="text-destructive text-base" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>删除</TooltipContent>
        </Tooltip>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除Snippet</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除该Snippet吗？
          </AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDelete() {
    await deleteSnippetQuery.mutateAsync(id);
  }
};
