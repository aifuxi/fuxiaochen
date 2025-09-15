"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { useParams, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { BytemdEditor } from "@/components/bytemd";

import { PATHS } from "@/constants";
import {
  type UpdateBlogRequest,
  updateBlogSchema,
  useGetBlog,
  useUpdateBlog,
} from "@/features/blog";
import { toSlug } from "@/lib/common";

export const EditBlogForm = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading } = useGetBlog(id, {
    enable: Boolean(id),
  });

  const mutation = useUpdateBlog();

  const router = useRouter();
  const form = useForm<UpdateBlogRequest>({
    resolver: zodResolver(updateBlogSchema),
  });

  React.useEffect(() => {
    form.setValue("title", blog?.title ?? "");
    form.setValue("id", blog?.id ?? "");
    form.setValue("slug", blog?.slug ?? "");
    form.setValue("description", blog?.description ?? "");
    form.setValue("body", blog?.body ?? "");
    form.setValue("published", blog?.published ?? false);
    form.setValue("tags", blog?.tags.map((el) => el.id) ?? []);
  }, [blog, form]);

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoaderCircle className="size-9 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form autoComplete="off">
        <div
          className={`
            fixed inset-x-24 bottom-10 z-10
            md:inset-x-[20vw]
          `}
        >
          <Button
            type="button"
            onClick={() => form.handleSubmit(handleSubmit)()}
            variant={"outline"}
            disabled={mutation.isMutating}
            className="!w-full"
          >
            {mutation.isMutating && <LoaderCircle className="animate-spin" />}
            保存
          </Button>
        </div>

        <div className="grid gap-4 px-1 pb-24">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="请输入标题..." />
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
                    <Input {...field} placeholder="请输入slug" />
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="请输入描述..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem>
                <FormLabel>是否发布</FormLabel>
                <FormControl>
                  <div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <div>
                    <BytemdEditor
                      body={field.value}
                      setContent={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  async function handleSubmit(values: UpdateBlogRequest) {
    await mutation.trigger(values);
    router.push(PATHS.ADMIN_BLOG);
  }

  function handleFormatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue("slug", formatted);
    }
  }
};
