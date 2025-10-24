"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { useParams, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import { type UpdateBlogRequest, updateBlogSchema } from "@/types/blog";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { BytemdEditor } from "@/components/bytemd";

import { PATHS } from "@/constants";
import { toSlug } from "@/lib/common";

import { TagField } from "./tag-field";

import { useGetBlog, useGetBlogMetaData, useUpdateBlog } from "../api";

export const EditBlogForm = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading } = useGetBlog(id, {
    enable: Boolean(id),
  });
  const {
    categoriesData,
    tagsData,
    loading: metaLoading,
  } = useGetBlogMetaData();
  const loading = metaLoading || isLoading;

  const mutation = useUpdateBlog();

  const router = useRouter();
  const form = useForm<UpdateBlogRequest>({
    resolver: zodResolver(updateBlogSchema),
    defaultValues: {
      title: "",
      id: "",
      slug: "",
      description: "",
      body: "",
      published: false,
      tags: [],
      category: "",
    },
  });

  React.useEffect(() => {
    if (loading || !blog) {
      return;
    }
    form.reset({
      title: blog?.title ?? "",
      id: blog?.id ?? "",
      slug: blog?.slug ?? "",
      description: blog?.description ?? "",
      body: blog?.body ?? "",
      published: blog?.published ?? false,
      tags: blog?.tags?.map((el) => el.id) ?? [],
      category: blog?.categoryId ?? "",
    });
  }, [blog, form, loading]);

  if (loading) {
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
          {!loading && (
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={blog?.categoryId ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择分类..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.categories.map((el) => (
                          <SelectItem key={el.id} value={el.id}>
                            {el.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标签</FormLabel>
                <FormControl>
                  <div>
                    <TagField
                      tags={tagsData?.tags ?? []}
                      value={field.value ?? []}
                      onChange={field.onChange}
                    />
                  </div>
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
