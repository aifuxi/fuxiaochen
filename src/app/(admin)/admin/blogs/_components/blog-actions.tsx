import React from "react";

import { type Blog } from "@prisma/client";
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

import { GET_BLOGS_KEY, useDeleteBlog } from "../api";

type Props = {
  blog: Blog;
};

export const BlogActions = ({ blog }: Props) => {
  const queryClient = getQueryClient();
  const { mutate } = useDeleteBlog();
  const [DeleteBlogConfirm, confirmDelete] = useConfirm({
    title: "提示",
    description: "确定要删除该文章吗？",
  });

  const handleEdit = () => {
    // TODO: 跳转编辑页
  };

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) {
      return;
    }

    mutate(blog.id, {
      onSuccess: () => {
        toast.success("删除成功");

        void queryClient.invalidateQueries({
          queryKey: [GET_BLOGS_KEY],
        });
      },
      onError: (error) => {
        toast.error(`删除失败，${error}`);
      },
    });
  };
  return (
    <React.Fragment>
      <DeleteBlogConfirm />
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
