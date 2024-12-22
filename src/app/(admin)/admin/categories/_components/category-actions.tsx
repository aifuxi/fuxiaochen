import React from "react";

import { type Category } from "@prisma/client";
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

import { GET_CATEGORIES_KEY, useDeleteCategory } from "../api";
import { useUpdateCategorySheet } from "../hooks/use-update-category-sheet";

type Props = {
  category: Category;
};

export const CategoryActions = ({ category }: Props) => {
  const queryClient = getQueryClient();
  const { mutate } = useDeleteCategory();
  const [DeleteCategoryConfirm, confirmDelete] = useConfirm({
    title: "提示",
    description: "确定要删除该分类吗？",
  });
  const { openSheet } = useUpdateCategorySheet();

  const handleEdit = () => {
    openSheet(category.id);
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) {
      return;
    }

    mutate(category.id, {
      onSuccess: () => {
        toast.success("删除成功");

        void queryClient.invalidateQueries({
          queryKey: [GET_CATEGORIES_KEY],
        });
      },
      onError: (error) => {
        toast.error(`删除失败，${error}`);
      },
    });
  };
  return (
    <React.Fragment>
      <DeleteCategoryConfirm />
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
