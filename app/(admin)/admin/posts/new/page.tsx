"use client";

import { useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Save,
  Send,
  Upload,
  X,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { apiRequest, fetchApiData } from "@/lib/api/fetcher";
import type { AdminCategory } from "@/lib/server/categories/mappers";
import type { AdminTag } from "@/lib/server/tags/mappers";
import { cn } from "@/lib/utils";

import { routes } from "@/constants/routes";

const TOOLBAR_ACTIONS = [
  { icon: Bold, label: "Bold", syntax: "**", wrap: true },
  { icon: Italic, label: "Italic", syntax: "_", wrap: true },
  { icon: Code, label: "Inline Code", syntax: "`", wrap: true },
  { separator: true },
  { icon: Heading2, label: "Heading 2", syntax: "## ", wrap: false },
  { icon: Heading3, label: "Heading 3", syntax: "### ", wrap: false },
  { separator: true },
  { icon: List, label: "Bullet List", syntax: "- ", wrap: false },
  { icon: ListOrdered, label: "Ordered List", syntax: "1. ", wrap: false },
  { icon: Quote, label: "Blockquote", syntax: "> ", wrap: false },
  { separator: true },
  { icon: Link2, label: "Link", syntax: "[](url)", wrap: false },
  { icon: ImageIcon, label: "Image", syntax: "![alt](url)", wrap: false },
  { icon: Minus, label: "Divider", syntax: "\n---\n", wrap: false },
];

export default function NewPostPage() {
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
  const [activeTab, setActiveTab] = useState("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-"),
    );
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

  const applyToolbarAction = (action: (typeof TOOLBAR_ACTIONS)[number]) => {
    if ("separator" in action) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    let newContent = content;
    let newCursorPos = start;

    if (action.wrap) {
      const wrapped = `${action.syntax}${selected || "text"}${action.syntax}`;
      newContent = content.slice(0, start) + wrapped + content.slice(end);
      newCursorPos = selected
        ? start + wrapped.length
        : start + action.syntax.length;
    } else {
      newContent =
        content.slice(0, start) + action.syntax + selected + content.slice(end);
      newCursorPos = start + action.syntax.length + selected.length;
    }

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderPreview = (markdown: string) => {
    return markdown
      .replace(
        /^### (.+)$/gm,
        '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>',
      )
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(
        /`(.+?)`/g,
        '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>',
      )
      .replace(
        /^> (.+)$/gm,
        '<blockquote class="border-l-4 border-border pl-4 text-muted-foreground italic my-4">$1</blockquote>',
      )
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^---$/gm, '<hr class="border-border my-6" />')
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" class="text-primary underline">$1</a>',
      )
      .replace(
        /!\[(.+?)\]\((.+?)\)/g,
        '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />',
      )
      .replace(/\n\n/g, "</p><p class='mb-4'>")
      .replace(/\n/g, "<br />");
  };

  const submitPost = async (shouldPublish: boolean) => {
    if (!title || !description || !content || !categoryId) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/admin/blogs", {
        method: "POST",
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-border bg-background flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.admin.posts}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Posts
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-muted-foreground text-sm">New Post</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {wordCount} words · {readTime} min read
          </span>
          <Button variant="outline" size="sm">
            <Eye className="mr-1.5 h-4 w-4" />
            Preview
          </Button>
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
            Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-border border-b px-8 py-5">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="placeholder:text-muted-foreground/40 w-full bg-transparent text-3xl font-bold tracking-tight focus:outline-none"
            />
            {slug && (
              <p className="text-muted-foreground mt-1.5 text-xs">
                Slug:{" "}
                <span className="text-foreground/70 font-mono">
                  /blog/{slug}
                </span>
              </p>
            )}
          </div>

          <div className="border-border bg-muted/30 flex items-center gap-0.5 border-b px-4 py-2">
            {TOOLBAR_ACTIONS.map((action, index) => {
              if ("separator" in action) {
                return (
                  <Separator
                    key={`sep-${index}`}
                    orientation="vertical"
                    className="mx-1 h-5"
                  />
                );
              }
              return (
                <button
                  key={action.label}
                  title={action.label}
                  onClick={() => applyToolbarAction(action)}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 w-7 items-center justify-center rounded transition-colors"
                >
                  <action.icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
            <div className="ml-auto flex items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-7">
                  <TabsTrigger value="write" className="h-5 px-2.5 text-xs">
                    Write
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="h-5 px-2.5 text-xs">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === "write" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your post in Markdown..."
                className="placeholder:text-muted-foreground/40 h-full w-full resize-none bg-transparent px-8 py-6 font-mono text-sm leading-relaxed focus:outline-none"
              />
            ) : (
              <div
                className="prose prose-neutral dark:prose-invert max-w-none px-8 py-6 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: content
                    ? `<p class='mb-4'>${renderPreview(content)}</p>`
                    : '<p class="text-muted-foreground">Nothing to preview yet.</p>',
                }}
              />
            )}
          </div>
        </div>

        <aside className="border-border bg-muted/20 flex w-72 shrink-0 flex-col overflow-y-auto border-l">
          <div className="p-5">
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
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
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
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
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Description
            </h3>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short summary of your post..."
              className="min-h-20 resize-none text-sm"
              maxLength={160}
            />
            <p className="text-muted-foreground mt-1.5 text-right text-xs">
              {description.length}/160
            </p>
          </div>

          <Separator />

          <div className="p-5">
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Cover Image
            </h3>
            {coverImage ? (
              <div className="group border-border relative overflow-hidden rounded-lg border">
                <Image
                  src={coverImage}
                  alt="Cover"
                  width={320}
                  height={180}
                  className="aspect-video w-full object-cover"
                />
                <button
                  onClick={() => setCoverImage("")}
                  className="bg-background/80 absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm transition-colors">
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
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
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
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
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
                      className="hover:text-destructive ml-0.5 rounded-full"
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
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 disabled:opacity-30"
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
                    "border-border text-muted-foreground rounded-full border px-2 py-0.5 text-xs",
                    "hover:border-foreground/30 hover:text-foreground transition-colors",
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
