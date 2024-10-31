"use client";

import * as React from "react";

import { LoaderCircle, Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useDeleteNote } from "@/features/note";

type DeleteNoteButtonProps = {
  id: string;
  refreshAsync: () => Promise<unknown>;
};

export const DeleteNoteButton = ({
  id,
  refreshAsync,
}: DeleteNoteButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const deleteNoteQuery = useDeleteNote();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={"icon"} variant="outline" onClick={() => setOpen(true)}>
          <Trash className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除笔记</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该笔记吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <Button
            variant="outline"
            disabled={deleteNoteQuery.loading}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button onClick={handleDeleteNote} disabled={deleteNoteQuery.loading}>
            {deleteNoteQuery.loading && (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            )}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDeleteNote() {
    await deleteNoteQuery.runAsync(id);
    await refreshAsync();
  }
};
