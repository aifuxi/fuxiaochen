"use client";

import React from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Pen, Save } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { TAG_TYPES, TAG_TYPE_MAP } from "@/constants";
import {
  type UpdateTagDTO,
  updateTagSchema,
  useGetTag,
  useUpdateTag,
} from "@/features/tag";
import { cn, toSlug } from "@/lib/utils";
import { convertSvgToDataUrl } from "@/utils";

type EditTagButtonProps = {
  id: string;
  refreshAsync: () => Promise<unknown>;
};

export const EditTagButton = ({ id, refreshAsync }: EditTagButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<UpdateTagDTO>({
    resolver: zodResolver(updateTagSchema),
  });

  const { data, loading } = useGetTag(id, open);

  const updateTagQuery = useUpdateTag();

  React.useEffect(() => {
    if (open && data?.tag) {
      const { tag } = data;
      form.setValue("name", tag.name);
      form.setValue("slug", tag.slug);
      form.setValue("type", tag.type);
      form.setValue("icon", tag.icon || "");
      form.setValue("iconDark", tag.iconDark || "");
      form.setValue("id", tag.id);
      form.clearErrors();
    }
  }, [data, form, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              variant="outline"
              onClick={() => setOpen(true)}
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
                      {loading ? (
                        <Skeleton className="h-10 w-full rounded-lg" />
                      ) : (
                        <Input {...field} disabled />
                      )}
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
                      {loading ? (
                        <Skeleton className="h-10 w-full rounded-lg" />
                      ) : (
                        <Input
                          className="flex-1"
                          placeholder="请输入标签名称"
                          {...field}
                        />
                      )}
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
                      {loading ? (
                        <Skeleton className="h-10 w-full rounded-lg" />
                      ) : (
                        <div className="flex w-full items-center gap-4">
                          <Input placeholder="请输入标签slug" {...field} />
                          <Button type="button" onClick={handleFormatSlug}>
                            格式化
                          </Button>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>类型</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={cn({
                            "text-muted-foreground": !field.value,
                          })}
                        >
                          <SelectValue placeholder="标签类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TAG_TYPES.map((el) => (
                          <SelectItem key={el} value={el}>
                            {TAG_TYPE_MAP[el]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      onClick={() => handleFormatIcon("icon")}
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
                      onClick={() => handleFormatIcon("iconDark")}
                    >
                      转为Data Url
                    </Button>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => form.handleSubmit(handleSubmit)()}
                  disabled={updateTagQuery.loading}
                >
                  {updateTagQuery.loading && (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  )}
                  保存
                  <Save className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  async function handleSubmit(values: UpdateTagDTO) {
    if (values.icon) {
      values.icon = convertSvgToDataUrl(values.icon);
    }
    if (values.iconDark) {
      values.iconDark = convertSvgToDataUrl(values.iconDark);
    }

    await updateTagQuery.runAsync(values);
    setOpen(false);
    await refreshAsync();
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
