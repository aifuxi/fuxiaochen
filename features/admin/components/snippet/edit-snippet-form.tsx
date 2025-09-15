"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { useRouter, useSearchParams } from "next/navigation";

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
  type UpdateSnippetRequest,
  updateSnippetSchema,
  useGetSnippet,
  useUpdateSnippet,
} from "@/features/snippet";
import { toSlug } from "@/lib/common";

export const EditSnippetForm = () => {
  const searchParams = useSearchParams();

  const id = searchParams.get("id") ?? "";

  const { data: snippet, isLoading } = useGetSnippet(id, {
    enable: Boolean(id),
  });

  const mutation = useUpdateSnippet();

  const router = useRouter();
  const form = useForm<UpdateSnippetRequest>({
    resolver: zodResolver(updateSnippetSchema),
  });

  React.useEffect(() => {
    form.setValue("title", snippet?.title ?? "");
    form.setValue("id", snippet?.id ?? "");
    form.setValue("slug", snippet?.slug ?? "");
    form.setValue("description", snippet?.description ?? "");
    form.setValue("body", snippet?.body ?? "");
    form.setValue("published", snippet?.published ?? false);
    form.setValue("tags", snippet?.tags.map((el) => el.id) ?? []);
  }, [snippet, form]);

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

  async function handleSubmit(values: UpdateSnippetRequest) {
    await mutation.trigger(values);
    router.push(PATHS.ADMIN_SNIPPET);
  }

  function handleFormatSlug() {
    const tmp = form.getValues().slug?.trim();
    if (tmp) {
      const formatted = toSlug(tmp);
      form.setValue("slug", formatted);
    }
  }
};
