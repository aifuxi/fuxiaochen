"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";
import { useRouter } from "next/navigation";

import breaks from "@bytemd/plugin-breaks";
import frontmatter from "@bytemd/plugin-frontmatter";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight-ssr";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import { Editor } from "@bytemd/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequest } from "ahooks";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import "highlight.js/styles/vs.css";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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

import { CyberContainer } from "@/components/admin/cyber-container";

import { useUpload } from "@/hooks/use-upload";
import { api } from "@/lib/api-client";

import "bytemd/dist/index.css";

const plugins = [gfm(), breaks(), highlight(), frontmatter(), mediumZoom()];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  cover: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

interface BlogEditorProps {
  blogId?: string;
}

export function BlogEditor({ blogId }: BlogEditorProps) {
  const router = useRouter();
  const { uploadFile } = useUpload();

  const { data: categories } = useRequest(() => api.get<any[]>("/categories"));
  const { data: tags } = useRequest(() => api.get<any[]>("/tags"));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      cover: "",
      published: false,
      featured: false,
      tagIds: [],
    },
  });

  useRequest(
    async () => {
      if (!blogId) return;
      return api.get<any>(`/blogs/${blogId}`);
    },
    {
      ready: !!blogId,
      onSuccess: (data) => {
        if (data) {
          form.reset({
            title: data.title,
            slug: data.slug,
            description: data.description,
            content: data.content,
            cover: data.cover || "",
            categoryId: data.categoryId,
            tagIds: data.tags?.map((t: any) => t.id) || [],
            published: data.published,
            featured: data.featured,
          });
        }
      },
    },
  );

  const { run: submit, loading: submitting } = useRequest(
    (values) => {
      if (blogId) {
        return api.put(`/blogs/${blogId}`, values);
      } else {
        return api.post("/blogs", values);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success(blogId ? "Blog updated" : "Blog created");
        router.push("/admin/blogs");
      },
      onError: (e) => toast.error(e.message),
    },
  );

  const handleUploadImage = async (files: File[]) => {
    const res = await Promise.all(
      files.map(async (file) => {
        const { url, name } = await uploadFile(file);
        return { url, title: name };
      }),
    );
    return res;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { url } = await uploadFile(file);
        form.setValue("cover", url);
        toast.success("Cover uploaded");
      } catch (e) {}
    }
  };

  return (
    <CyberContainer
      title={blogId ? "EDIT_ENTRY" : "NEW_ENTRY"}
      action={
        <Link href="/admin/blogs">
          <Button
            variant="ghost"
            className={`
              text-gray-400
              hover:text-neon-cyan
            `}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK
          </Button>
        </Link>
      }
    >
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
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
                    <FormLabel className="text-gray-400">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Blog Title"
                        {...field}
                        className={`
                          border-white/10 bg-white/5 text-gray-200
                          focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                        `}
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
                    <FormLabel className="text-gray-400">Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="blog-slug"
                        {...field}
                        className={`
                          border-white/10 bg-white/5 text-gray-200
                          focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                        `}
                      />
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
                  <FormLabel className="text-gray-400">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description..."
                      {...field}
                      className={`
                        border-white/10 bg-white/5 text-gray-200
                        focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                      `}
                    />
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
                    <FormLabel className="text-gray-400">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={`
                            border-white/10 bg-white/5 text-gray-200
                            focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                          `}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/10 bg-black/90 backdrop-blur-xl">
                        {categories?.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={c.id}
                            className={`
                              text-gray-300
                              focus:bg-neon-cyan/20 focus:text-white
                            `}
                          >
                            {c.name}
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
                name="cover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Cover Image</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Image URL"
                          {...field}
                          className={`
                            border-white/10 bg-white/5 text-gray-200
                            focus:border-neon-cyan/50 focus:ring-neon-cyan/20
                          `}
                        />
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className={`
                              border-white/10 bg-white/5 text-gray-300
                              hover:bg-white/10
                            `}
                          >
                            Upload
                          </Button>
                          <input
                            type="file"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            accept="image/*"
                            onChange={handleCoverUpload}
                          />
                        </div>
                      </div>
                    </FormControl>
                    {field.value && (
                      <img
                        src={field.value}
                        alt="Cover"
                        className="mt-2 h-32 rounded border border-white/10 object-cover"
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tagIds"
              render={() => (
                <FormItem>
                  <FormLabel className="text-gray-400">Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 rounded-md border border-white/10 bg-white/5 p-3">
                    {tags?.map((tag) => (
                      <FormField
                        key={tag.id}
                        control={form.control}
                        name="tagIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={tag.id}
                              className="flex flex-row items-start space-y-0 space-x-2"
                            >
                              <FormControl>
                                <Checkbox
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
                                  className={`
                                    border-neon-cyan/50
                                    data-[state=checked]:bg-neon-cyan data-[state=checked]:text-black
                                  `}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer pt-0.5 font-mono text-xs font-normal text-gray-300">
                                {tag.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem
                    className={`
                      flex flex-1 flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3
                      shadow-sm
                    `}
                  >
                    <div className="mr-4 space-y-0.5">
                      <FormLabel className="text-gray-200">Published</FormLabel>
                      <FormDescription className="text-gray-500">
                        Visible to public
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={`
                          data-[state=checked]:bg-neon-green
                          data-[state=unchecked]:bg-gray-700
                        `}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem
                    className={`
                      flex flex-1 flex-row items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3
                      shadow-sm
                    `}
                  >
                    <div className="mr-4 space-y-0.5">
                      <FormLabel className="text-gray-200">Featured</FormLabel>
                      <FormDescription className="text-gray-500">
                        Show in home/featured
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={`
                          data-[state=checked]:bg-neon-magenta
                          data-[state=unchecked]:bg-gray-700
                        `}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Content</FormLabel>
                  <FormControl>
                    <div className="bytemd-dark overflow-hidden rounded-md border border-white/10 bg-black/50">
                      <Editor
                        value={field.value}
                        plugins={plugins}
                        onChange={(v) => field.onChange(v)}
                        uploadImages={handleUploadImage}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className={`
                w-full bg-neon-cyan font-bold text-black
                hover:bg-neon-cyan/80
                md:w-auto
              `}
            >
              {blogId ? "UPDATE_ENTRY" : "CREATE_ENTRY"}
            </Button>
          </form>
        </Form>
      </div>
    </CyberContainer>
  );
}
