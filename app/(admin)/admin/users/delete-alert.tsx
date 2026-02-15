"use client";

import { useState } from "react";
import NiceModal from "@ebay/nice-modal-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAction } from "@/app/actions/user";
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
  onSuccess?: () => void;
}

export const DeleteAlert = NiceModal.create(
  ({ id, onSuccess }: DeleteAlertProps) => {
    const [loading, setLoading] = useState(false);
    const modal = NiceModal.useModal();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteUserAction(id);
      if (!res.success) throw new Error(res.error);
      modal.remove();
      onSuccess?.();
    } catch (error) {
      toast.error(`${error}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={modal.visible} onOpenChange={modal.remove}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作无法撤销。该用户将被永久删除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
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
  },
);
