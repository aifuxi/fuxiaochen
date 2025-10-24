"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Pen } from "lucide-react";

import { type UpdateTagRequest, updateTagSchema } from "@/types/tag";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toSlug } from "@/lib/common";
import { convertSvgToDataUrl } from "@/utils";

import { useGetTag, useUpdateTag } from "../api";

interface UpdateTagButtonProps {
  id: string;
  onSuccess?: () => void;
}

export const UpdateTagButton = ({ id, onSuccess }: UpdateTagButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateTagRequest>({
    resolver: zodResolver(updateTagSchema),
    defaultValues: {
      name: "",
      slug: "",
      icon: "",
      iconDark: "",
      id: "",
    },
  });

  const { data, isLoading } = useGetTag(id, { enable: open });
  const mutation = useUpdateTag();

  React.useEffect(() => {
    if (!open) {
      form.reset();
      form.clearErrors();
    }

    if (data) {
      form.setValue("name", data.name);
      form.setValue("slug", data.slug);
      form.setValue("icon", data.icon ?? "");
      form.setValue("iconDark", data.iconDark ?? "");
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
          <DialogTitle>编辑标签</DialogTitle>
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
                          placeholder="请输入标签名称"
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
                          <Input placeholder="请输入标签slug" {...field} />
                          <Button type="button" onClick={handleFormatSlug}>
                            格式化
                          </Button>
                        </div>
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
                        <Textarea
                          placeholder="请输入一个svg字符串（会自动转换为data url）或者data
                        url或者一个图片地址"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage></FormMessage>
                      <Button
                        type="button"
                        onClick={() => {
                          handleFormatIcon("icon");
                        }}
                      >
                        转为Data Url
                      </Button>
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
                        <Textarea
                          placeholder="请输入一个svg字符串（会自动转换为data url）或者data
                        url或者一个图片地址"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <Button
                        type="button"
                        onClick={() => {
                          handleFormatIcon("iconDark");
                        }}
                      >
                        转为Data Url
                      </Button>
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

  async function handleSubmit(values: UpdateTagRequest) {
    if (values.icon) {
      values.icon = convertSvgToDataUrl(values.icon);
    }
    if (values.iconDark) {
      values.iconDark = convertSvgToDataUrl(values.iconDark);
    }

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

  function handleFormatIcon(type: "icon" | "iconDark") {
    if (type === "icon") {
      const tmp = form.getValues().icon?.trim();
      if (tmp) {
        const formatted = convertSvgToDataUrl(tmp);
        form.setValue("icon", formatted);
      }
    } else if (type === "iconDark") {
      const tmp = form.getValues().iconDark?.trim();
      if (tmp) {
        const formatted = convertSvgToDataUrl(tmp);
        form.setValue("iconDark", formatted);
      }
    }
  }
};
