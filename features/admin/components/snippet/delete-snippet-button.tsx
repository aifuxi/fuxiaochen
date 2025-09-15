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

import { useDeleteSnippet } from "@/features/snippet";

interface DeleteSnippetButtonProps {
  id: string;
  onSuccess?: () => void;
}

export const DeleteSnippetButton = ({
  id,
  onSuccess,
}: DeleteSnippetButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const mutation = useDeleteSnippet(id);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size={"icon"}
          variant="outline"
          onClick={() => {
            setOpen(true);
          }}
        >
          <Trash className="text-destructive" />
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
            disabled={mutation.isMutating}
            onClick={() => {
              setOpen(false);
            }}
          >
            取消
          </Button>
          <Button onClick={handleDelete} disabled={mutation.isMutating}>
            {mutation.isMutating && <LoaderCircle className="animate-spin" />}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDelete() {
    await mutation.trigger();
    setOpen(false);
    onSuccess?.();
  }
};
