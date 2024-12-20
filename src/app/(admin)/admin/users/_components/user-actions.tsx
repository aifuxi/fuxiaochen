import React from "react";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useConfirm } from "@/hooks/use-confirm";
import { getQueryClient } from "@/lib/get-query-client";

import { useDeleteUser } from "../api";
import { useUpdateUserSheet } from "../hooks/use-update-user-sheet";

type Props = {
  userId: number;
  email: string;
};

export const UserActions = ({ userId, email }: Props) => {
  const queryClient = getQueryClient();
  const { mutate } = useDeleteUser();
  const [DeleteUserConfirm, confirmDelete] = useConfirm({
    title: "提示",
    description: "确定要删除该用户吗？",
  });
  const { openSheet } = useUpdateUserSheet();

  const handleEdit = () => {
    openSheet(email);
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) {
      return;
    }

    mutate(userId, {
      onSuccess: () => {
        toast.success("删除成功");

        void queryClient.invalidateQueries({
          queryKey: ["getUsers"],
        });
      },
      onError: (error) => {
        toast.error(`删除失败，${error}`);
      },
    });
  };
  return (
    <React.Fragment>
      <DeleteUserConfirm />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div
              className="inline-flex items-center gap-2 text-destructive"
              onClick={handleDelete}
            >
              <Trash2 />
              删除
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </React.Fragment>
  );
};
