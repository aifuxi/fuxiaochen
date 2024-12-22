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

import { GET_TAGS_KEY, useCreateTag } from "../api";
import { useCreateTagSheet } from "../hooks/use-create-tag-sheet";
import { type CreateTagRequestType, createTagSchema } from "../schema";

export const CreateTagSheet = () => {
  const { isOpen, setIsOpen, closeSheet } = useCreateTagSheet();
  const form = useForm<CreateTagRequestType>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });
  const queryClient = getQueryClient();
  const { mutate, isPending: createTagLoading } = useCreateTag();

  const handleSubmit = (values: CreateTagRequestType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("创建成功");
        void closeSheet();
        void queryClient.invalidateQueries({
          queryKey: [GET_TAGS_KEY],
        });
      },
      onError: (error) => {
        toast.error(`创建失败，${error}`);
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="md:max-w-2xl">
        <SheetHeader>
          <SheetTitle>创建标签</SheetTitle>
          <SheetDescription>填写以下信息来创建一个新标签</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form autoComplete="off">
            <div className="grid gap-4">
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
            disabled={createTagLoading}
            onClick={() => form.handleSubmit(handleSubmit)()}
          >
            创建
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
