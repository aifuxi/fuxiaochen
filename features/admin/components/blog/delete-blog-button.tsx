"use client";

import React from "react";

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

import { useDeleteBlog } from "@/features/blog";

type DeleteBlogButtonProps = {
  id: string;
  refreshAsync: () => Promise<unknown>;
};

export const DeleteBlogButton = ({
  id,
  refreshAsync,
}: DeleteBlogButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const deleteBlogQuery = useDeleteBlog();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={"icon"} variant="outline" onClick={() => setOpen(true)}>
          <Trash className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTrigger>
          <AlertDialogTitle>删除博客</AlertDialogTitle>
          <AlertDialogDescription>确定要删除该博客吗？</AlertDialogDescription>
        </AlertDialogTrigger>
        <AlertDialogFooter>
          <Button
            variant="outline"
            disabled={deleteBlogQuery.loading}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
          <Button onClick={handleDelete} disabled={deleteBlogQuery.loading}>
            {deleteBlogQuery.loading && (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            )}
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  async function handleDelete() {
    await deleteBlogQuery.runAsync(id);
    setOpen(false);
    await refreshAsync();
  }
};
