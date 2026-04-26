"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Plus, Save, Send, Upload, X } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { MarkdownEditor } from "@/components/markdown-editor";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminBlog } from "@/lib/server/blogs/mappers";
import type { AdminCategory } from "@/lib/server/categories/mappers";
import type { AdminTag } from "@/lib/server/tags/mappers";
import { cn } from "@/lib/utils";

import { routes } from "@/constants/routes";

type AdminPostEditorProps =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      slug: string;
    };

const slugifyInput = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

export function AdminPostEditor(props: AdminPostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydratedPostId, setHydratedPostId] = useState<string | null>(null);

  const editPostUrl =
    props.mode === "edit"
      ? `/api/admin/blogs/by-slug/${encodeURIComponent(props.slug)}`
      : null;
  const { data: postData, isLoading: isPostLoading } = useSWR<AdminBlog>(
    editPostUrl,
    fetchApiData,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );
  const { data: categoriesData } = useSWR<{ items: AdminCategory[] }>(
    "/api/admin/categories?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );
  const { data: tagsData } = useSWR<{ items: AdminTag[] }>(
    "/api/admin/tags?pageSize=100&sortBy=name&sortDirection=asc",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const categories = categoriesData?.items ?? [];
  const allTags = tagsData?.items ?? [];

  useEffect(() => {
    if (!postData || hydratedPostId === postData.id) {
      return;
    }

    setTitle(postData.title);
    setSlug(postData.slug);
    setDescription(postData.description);
    setContent(postData.content);
    setCoverImage(postData.coverImage);
    setCategoryId(postData.categoryId);
    setSelectedTagIds(postData.tagIds);
    setFeatured(postData.featured);
    setPublished(postData.published);
    setHydratedPostId(postData.id);
  }, [hydratedPostId, postData]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim(),
      );
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(slugifyInput(value));
  };

  const addTag = (tagId: string) => {
    if (!tagId || selectedTagIds.includes(tagId)) {
      return;
    }

    setSelectedTagIds((current) => [...current, tagId]);
    setTagInput("");
  };

  const addTagFromInput = () => {
    const matchedTag = allTags.find(
      (tag) =>
        tag.name.toLowerCase() === tagInput.trim().toLowerCase() ||
        tag.slug.toLowerCase() === tagInput.trim().toLowerCase(),
    );

    if (matchedTag) {
      addTag(matchedTag.id);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.filter((selectedTagId) => selectedTagId !== tagId),
    );
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTagFromInput();
    }
  };

  const submitPost = async (shouldPublish: boolean) => {
    if (!title || !description || !content || !categoryId) {
      return;
    }

    const isEditing = props.mode === "edit";
    let requestUrl = "/api/admin/blogs";
    let requestMethod = "POST";

    if (isEditing) {
      if (!postData) {
        return;
      }

      requestUrl = `/api/admin/blogs/${postData.id}`;
      requestMethod = "PATCH";
    }

    setIsSubmitting(true);

    try {
      await apiRequest(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          coverImage,
          featured,
          published: shouldPublish,
          categoryId,
          tagIds: selectedTagIds,
        }),
      });

      router.push(routes.admin.posts);
      router.refresh();
    } catch {
      // The global API error listener owns toast display.
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));
  const suggestedTags = allTags
    .filter((tag) => !selectedTagIds.includes(tag.id))
    .filter((tag) =>
      tagInput
        ? `${tag.name} ${tag.slug}`
            .toLowerCase()
            .includes(tagInput.trim().toLowerCase())
        : true,
    )
    .slice(0, 8);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const isEditLoading = props.mode === "edit" && isPostLoading;
  const pageLabel = props.mode === "edit" ? "Edit Post" : "New Post";
  const publishButtonLabel =
    props.mode === "edit" ? "Save & Publish" : "Publish";

  if (isEditLoading) {
    return (
      <div className="flex h-[calc(100dvh-7rem)] items-center justify-center text-sm text-muted-foreground">
        Loading post...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.admin.posts}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Posts
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">{pageLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {wordCount} words · {readTime} min read
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => submitPost(false)}
          >
            <Save className="mr-1.5 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => submitPost(true)}
          >
            <Send className="mr-1.5 h-4 w-4" />
            {publishButtonLabel}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border px-8 py-5">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="w-full bg-transparent text-3xl font-bold tracking-tight placeholder:text-muted-foreground/40 focus:outline-none"
            />
            {slug && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Slug:{" "}
                <span className="font-mono text-foreground/70">
                  /blog/{slug}
                </span>
              </p>
            )}
          </div>

          <MarkdownEditor
            className="min-h-0 flex-1"
            value={content}
            onChange={setContent}
            placeholder="Start writing your post in Markdown..."
          />
        </div>

        <aside className="flex min-h-0 w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-muted/20">
          <div className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Publish
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="text-sm">
                  Published
                </Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="text-sm">
                  Featured
                </Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Slug
            </h3>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="post-url-slug"
              className="font-mono text-xs"
            />
          </div>

          <Separator />

          <div className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Description
            </h3>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of your post..."
              className="min-h-20 resize-none text-sm"
              maxLength={160}
            />
            <p className="mt-1.5 text-right text-xs text-muted-foreground">
              {description.length}/160
            </p>
          </div>

          <Separator />

          <div className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Cover Image
            </h3>
            {coverImage ? (
              <div className="group relative overflow-hidden rounded-lg border border-border">
                <Image
                  src={coverImage}
                  alt="Cover"
                  width={320}
                  height={180}
                  className="aspect-video w-full object-cover"
                />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50">
                  <Upload className="h-5 w-5" />
                  <span>Upload image</span>
                </button>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Category
            </h3>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="p-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tags
            </h3>
            {selectedTags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-1 pr-1 text-xs"
                  >
                    {tag.slug}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-0.5 rounded-full hover:text-destructive"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="relative">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Search existing tags..."
                className="pr-8 text-xs"
              />
              <button
                onClick={addTagFromInput}
                disabled={!tagInput.trim()}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {suggestedTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => addTag(tag.id)}
                  className={cn(
                    "rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground",
                    "transition-colors hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  + {tag.slug}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
