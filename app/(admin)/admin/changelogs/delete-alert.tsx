"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";

import { deleteChangelogAction } from "@/app/actions/changelog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteAlertProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteAlert({
  id,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAlertProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteChangelogAction(id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-neon-magenta/20 bg-black/90 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-neon-magenta">
            确认删除？
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            此操作无法撤销。该 Changelog 将被永久删除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={`
              border-white/20 bg-transparent text-gray-300
              hover:bg-white/10 hover:text-white
            `}
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className={`
              hover:bg-magenta-600
              bg-neon-magenta text-white
            `}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
