import React from "react";

import { type Tag } from "@prisma/client";
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

import { GET_TAGS_KEY, useDeleteTag } from "../api";
import { useUpdateTagSheet } from "../hooks/use-update-tag-sheet";

type Props = {
  tag: Tag;
};

export const TagActions = ({ tag }: Props) => {
  const queryClient = getQueryClient();
  const { mutate } = useDeleteTag();
  const [DeleteTagConfirm, confirmDelete] = useConfirm({
    title: "提示",
    description: "确定要删除该标签吗？",
  });
  const { openSheet } = useUpdateTagSheet();

  const handleEdit = () => {
    openSheet(tag.id);
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) {
      return;
    }

    mutate(tag.id, {
      onSuccess: () => {
        toast.success("删除成功");

        void queryClient.invalidateQueries({
          queryKey: [GET_TAGS_KEY],
        });
      },
      onError: (error) => {
        toast.error(`删除失败，${error}`);
      },
    });
  };
  return (
    <React.Fragment>
      <DeleteTagConfirm />
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
