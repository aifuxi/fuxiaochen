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

import { useDeleteUser } from "../api";

interface DeleteUserButtonProps {
  id: string;
  onSuccess?: () => void;
}

export const DeleteUserButton = ({ id, onSuccess }: DeleteUserButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const mutation = useDeleteUser(id);

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
          <AlertDialogTitle>删除用户</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该用户吗？</AlertDialogDescription>
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
          <Button onClick={handleDeleteTag} disabled={mutation.isMutating}>
            {mutation.isMutating && <LoaderCircle className="animate-spin" />}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDeleteTag() {
    await mutation.trigger();
    setOpen(false);
    onSuccess?.();
  }
};
