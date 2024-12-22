import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { getQueryClient } from "@/lib/get-query-client";

import { GET_CATEGORIES_KEY, useGetCategory, useUpdateCategory } from "../api";
import { useUpdateCategorySheet } from "../hooks/use-update-category-sheet";
import {
  type UpdateCategoryRequestType,
  updateCategorySchema,
} from "../schema";

export const UpdateCategorySheet = () => {
  const { isOpen, tagId, setIsOpen, closeSheet, setCategoryId } =
    useUpdateCategorySheet();
  const form = useForm<UpdateCategoryRequestType>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: undefined,
      name: "",
      slug: "",
      description: "",
    },
  });
  const queryClient = getQueryClient();

  const { data } = useGetCategory(tagId);
  const { mutate, isPending: updateCategoryLoading } = useUpdateCategory();

  useEffect(() => {
    if (data?.data) {
      form.setValue("name", data?.data?.name);
      form.setValue("slug", data?.data?.slug);
      form.setValue("description", data?.data?.description);
      if (tagId) {
        form.setValue("id", tagId);
      }
      if (data?.data?.icon) {
        form.setValue("icon", data?.data?.icon);
      }
      if (data?.data?.iconDark) {
        form.setValue("iconDark", data?.data?.iconDark);
      }
    }
  }, [data, form, tagId]);

  const handleSubmit = (values: UpdateCategoryRequestType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("更新成功");
        void closeSheet();
        void queryClient.invalidateQueries({
          queryKey: [GET_CATEGORIES_KEY],
        });
      },
      onError: (error) => {
        toast.error(`更新失败，${error}`);
      },
    });
  };

  const handleOpenChange = (value: boolean) => {
    void setIsOpen(value);
    if (!value) {
      void setCategoryId(null);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>更新分类</SheetTitle>
          <SheetDescription>填写以下信息来更新一个分类</SheetDescription>
        </SheetHeader>
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
                      <Input placeholder="请输入" {...field} disabled />
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
                      <Input placeholder="请输入" {...field} />
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
                    <FormLabel>别名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>浅色图标</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconDark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>深色图标</FormLabel>
                    <FormControl>
                      <Textarea placeholder="请输入" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <SheetFooter className="pt-8">
          <Button
            type="button"
            className="w-full"
            disabled={updateCategoryLoading}
            onClick={() => form.handleSubmit(handleSubmit)()}
          >
            更新
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
