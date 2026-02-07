"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      const res = await deleteChangelogAction(id);
      if (!res.success) throw new Error(res.error);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(`${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-color)] backdrop-blur-xl`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--text-color)]">
            确认删除？
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--text-color-secondary)]">
            此操作无法撤销。该日志将被永久删除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={`
              border-[var(--glass-border)] bg-transparent text-[var(--text-color-secondary)]
              hover:bg-[var(--glass-bg)] hover:text-[var(--text-color)]
            `}
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className={`
              bg-red-500 text-white
              hover:bg-red-600
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
