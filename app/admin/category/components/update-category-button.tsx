"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Pen } from "lucide-react";

import {
  type UpdateCategoryRequest,
  updateCategorySchema,
} from "@/types/category";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toSlug } from "@/lib/common";

import { useGetCategory, useUpdateCategory } from "../api";

interface UpdateCategoryButtonProps {
  id: string;
  onSuccess?: () => void;
}

export const UpdateCategoryButton = ({
  id,
  onSuccess,
}: UpdateCategoryButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateCategoryRequest>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      id: "",
    },
  });

  const { data, isLoading } = useGetCategory(id, { enable: open });
  const mutation = useUpdateCategory();

  React.useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }

    if (data) {
      form.setValue("name", data.name);
      form.setValue("slug", data.slug);
      form.setValue("id", data.id);
    }
  }, [form, open, data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              variant="outline"
              onClick={() => {
                setOpen(true);
              }}
            >
              <Pen className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>编辑</TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑分类</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <LoaderCircle className="size-9 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form autoComplete="off">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>id</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名称</FormLabel>
                      <FormControl>
                        <Input
                          className="flex-1"
                          placeholder="请输入分类名称"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>slug</FormLabel>
                      <FormControl>
                        <div className="flex w-full items-center gap-4">
                          <Input placeholder="请输入分类slug" {...field} />
                          <Button type="button" onClick={handleFormatSlug}>
                            格式化
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="button"
                    onClick={() => form.handleSubmit(handleSubmit)()}
                    disabled={mutation.isMutating}
                  >
                    {mutation.isMutating && (
                      <LoaderCircle className="animate-spin" />
                    )}
                    保存
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: UpdateCategoryRequest) {
    await mutation.trigger(values);
    setOpen(false);
    onSuccess?.();
  }

  function handleFormatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue("slug", formatted);
    }
  }
};
