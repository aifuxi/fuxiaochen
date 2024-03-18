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
  IconSolarRestartLinear,
  IconSolarTrashBinMinimalistic2,
} from '@/components/icons';

import { useDeleteNote } from '@/features/note';

type DeleteNoteButtonProps = {
  id: string;
  refresh: () => void;
};

export const DeleteNoteButton = ({ id, refresh }: DeleteNoteButtonProps) => {
  const deleteNoteQuery = useDeleteNote();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'icon'} variant="outline">
          <IconSolarTrashBinMinimalistic2 className="text-base text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除笔记</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该笔记吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteNote}
            disabled={deleteNoteQuery.loading}
          >
            {deleteNoteQuery.loading && (
              <IconSolarRestartLinear className="mr-2 text-base animate-spin" />
            )}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  function handleDeleteNote() {
    deleteNoteQuery.run(id);
    refresh();
  }
};
