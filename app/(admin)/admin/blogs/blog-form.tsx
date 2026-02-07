"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import breaks from "@bytemd/plugin-breaks";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import { Editor } from "@bytemd/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import "highlight.js/styles/atom-one-dark.css";
import { createBlogAction, updateBlogAction } from "@/app/actions/blog";
import { getPresignUploadInfo } from "@/app/actions/upload";
import { type Blog } from "@/types/blog";
import { type Category } from "@/types/category";
import { type Tag } from "@/types/tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import copyCodePlugin from "@/components/blog/plugin-copy-code";
import headingsPlugin from "@/components/blog/plugin-headings";
import "bytemd/dist/index.css";

const plugins = [
  gfm(),
  breaks(),
  highlight(),
  mediumZoom(),
  copyCodePlugin(),
  headingsPlugin(),
];

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().min(1, "描述不能为空"),
  content: z.string().min(1, "内容不能为空"),
  cover: z.string().optional(),
  categoryId: z.string().min(1, "请选择分类"),
  tags: z.array(z.string()).optional(),
  published: z.boolean(),
  featured: z.boolean(),
});

interface BlogFormProps {
  initialData?: Blog;
  categories: Category[];
  tags: Tag[];
}

export function BlogForm({ initialData, categories, tags }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      cover: initialData?.cover || "",
      categoryId: initialData?.categoryID || "",
      tags: initialData?.tags?.map((t) => t.id) || [],
      published: initialData?.published || false,
      featured: initialData?.featured || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (initialData) {
        const res = await updateBlogAction(initialData.id, values);
        if (!res.success) {
          throw new Error(res.error);
        }
      } else {
        const res = await createBlogAction(values);
        if (!res.success) {
          throw new Error(res.error);
        }
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div
            className={`
              grid grid-cols-1 gap-6
              md:grid-cols-2
            `}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="文章标题" />
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="article-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="文章简短描述..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div
            className={`
              grid grid-cols-1 gap-6
              md:grid-cols-2
            `}
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>标签</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`
                            justify-between
                            ${!field.value?.length && "text-muted-foreground"}
                          `}
                        >
                          {field.value?.length
                            ? `${field.value.length} 个已选`
                            : "选择标签"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <ScrollArea className="h-[200px] p-4">
                        <div className="space-y-2">
                          {tags.map((tag) => (
                            <div
                              key={tag.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={tag.id}
                                checked={field.value?.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...(field.value || []),
                                        tag.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== tag.id,
                                        ),
                                      );
                                }}
                              />
                              <label
                                htmlFor={tag.id}
                                className={`
                                  text-sm leading-none font-medium
                                  peer-disabled:cursor-not-allowed peer-disabled:opacity-70
                                `}
                              >
                                {tag.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value?.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      return tag ? (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                        >
                          {tag.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>封面图 URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/image.png"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--text-color)]">内容</FormLabel>
                <FormControl>
                  <div className="bytemd-dark">
                    <Editor
                      value={field.value}
                      plugins={plugins}
                      uploadImages={async (files) => {
                        const result = await Promise.all(
                          files.map(
                            async (
                              file,
                            ): Promise<
                              {
                                url: string;
                                name: string;
                                title: string;
                                alt: string;
                              }[]
                            > => {
                              const presignRes = await getPresignUploadInfo(
                                file.name,
                              );

                              if (!presignRes.success || !presignRes.data) {
                                toast.error(`${presignRes.error}`);
                                return [];
                              }

                              const { uploadUrl, signedHeaders, name, url } =
                                presignRes.data || {};

                              const res = await fetch(uploadUrl, {
                                method: "PUT",
                                headers: signedHeaders,
                                body: files[0],
                              });

                              if (res.ok) {
                                return [
                                  {
                                    url: url || "",
                                    name: name || "",
                                    title: name || "",
                                    alt: name || "",
                                  },
                                ];
                              }
                              return [];
                            },
                          ),
                        );

                        return result.flat();
                      }}
                      onChange={(v) => {
                        field.onChange(v);
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-8">
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem
                  className={`
                    flex flex-row items-center justify-between rounded-lg border border-[var(--glass-border)]
                    bg-[var(--glass-bg)] p-4
                  `}
                >
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-[var(--text-color)]">
                      发布
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">精选</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/blogs")}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`
                bg-[var(--accent-color)] text-white
                hover:bg-[var(--accent-color)]/90
              `}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </div>
        </form>
      </Form>
    </GlassCard>
  );
}
