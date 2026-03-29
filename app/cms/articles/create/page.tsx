"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Image,
  UploadCloud,
  X,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Code,
  FileCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Send,
  Eye,
  Save,
  Cloud,
  CloudOff,
  Loader2,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tag {
  id: string;
  name: string;
}

type ToolbarButton = {
  icon: LucideIcon;
  title: string;
};

type ToolbarDivider = {
  type: "divider";
};

type ToolbarItem = ToolbarButton | ToolbarDivider;

const toolbarButtons: ToolbarItem[] = [
  { icon: Bold, title: "Bold" },
  { icon: Italic, title: "Italic" },
  { icon: Underline, title: "Underline" },
  { type: "divider" },
  { icon: Heading1, title: "Heading 1" },
  { icon: Heading2, title: "Heading 2" },
  { icon: Heading3, title: "Heading 3" },
  { type: "divider" },
  { icon: List, title: "Bullet List" },
  { icon: ListOrdered, title: "Numbered List" },
  { icon: Quote, title: "Quote" },
  { type: "divider" },
  { icon: Link2, title: "Link" },
  { icon: ImageIcon, title: "Image" },
  { icon: Code, title: "Code" },
  { icon: FileCode, title: "Code Block" },
  { type: "divider" },
  { icon: AlignLeft, title: "Align Left" },
  { icon: AlignCenter, title: "Align Center" },
  { icon: AlignRight, title: "Align Right" },
];

export default function CreateArticlePage() {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [tags, setTags] = React.useState<Tag[]>([
    { id: "1", name: "tutorial" },
    { id: "2", name: "react" },
  ]);
  const [tagInput, setTagInput] = React.useState("");
  const [featured, setFeatured] = React.useState(false);
  const [coverImage, setCoverImage] = React.useState<string | null>(
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=300&fit=crop"
  );
  const [wordCount, setWordCount] = React.useState(0);
  const [publishStatus, setPublishStatus] = React.useState<"draft" | "published">("draft");
  const [autosaveStatus, setAutosaveStatus] = React.useState<"saved" | "saving" | "offline">("saved");
  const [activeToolbar, setActiveToolbar] = React.useState<Set<string>>(new Set());
  const [isPublishing, setIsPublishing] = React.useState(false);

  const contentRef = React.useRef<HTMLDivElement>(null);

  // Generate slug from title
  React.useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fa5]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 50);
      setSlug(generatedSlug);
    }
  }, [title]);

  // Update word count
  const updateWordCount = React.useCallback(() => {
    if (content) {
      const text = content.trim();
      const words = text ? text.split(/\s+/).length : 0;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [content]);

  // Toggle toolbar button
  const toggleToolbar = (title: string) => {
    setActiveToolbar((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  // Add tag
  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (trimmed && !tags.find((t) => t.name === trimmed)) {
      setTags([...tags, { id: Date.now().toString(), name: trimmed }]);
    }
    setTagInput("");
  };

  // Remove tag
  const removeTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  // Handle tag input key down
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Handle cover image upload
  const handleCoverUpload = () => {
    // In a real app, this would open a file picker
    alert("File browser would open here");
  };

  // Remove cover image
  const handleRemoveCover = () => {
    setCoverImage(null);
  };

  // Handle publish
  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishStatus("published");
    }, 1500);
  };

  // Handle save draft
  const handleSaveDraft = () => {
    setAutosaveStatus("saving");
    setTimeout(() => {
      setAutosaveStatus("saved");
    }, 1000);
  };

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/cms/articles"
            className={cn(
              "flex items-center gap-2 text-muted transition-colors",
              "hover:text-foreground"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Articles</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>
      </motion.div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
          Create Article
        </h1>
        <p className="text-muted">Write and publish a new article to your blog.</p>
      </motion.div>

      {/* Editor Layout */}
      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          "lg:grid-cols-[1fr_320px]"
        )}
      >
        {/* Main Editor */}
        <div className="flex flex-col gap-6">
          {/* Title Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title..."
                  className={cn(
                    "w-full bg-transparent py-4 font-serif text-3xl",
                    "font-semibold text-foreground outline-none",
                    "placeholder:text-muted"
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Cover Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Image className="h-4 w-4 text-primary" />
                  Cover Image
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {coverImage ? (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="max-h-64 w-full object-cover"
                    />
                    <button
                      onClick={handleRemoveCover}
                      className={cn(
                        "absolute top-3 right-3 flex h-8 w-8 items-center",
                        "justify-center rounded-full bg-black/70 text-white",
                        "opacity-0 transition-opacity",
                        "group-hover:opacity-100",
                        "hover:bg-black/80"
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCoverUpload}
                    className={cn(
                      "flex h-40 w-full cursor-pointer flex-col items-center",
                      "justify-center gap-3 rounded-xl border-2 border-dashed",
                      "border-border transition-all",
                      "hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    <UploadCloud className="h-12 w-12 text-muted" />
                    <p className="text-sm text-muted">
                      Drag & drop an image or{" "}
                      <span className="font-medium text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted">PNG, JPG up to 5MB</p>
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Editor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardHeader className="border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <svg
                      className="h-4 w-4 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Content
                  </div>
                  <span className="text-xs text-muted">{wordCount} words</span>
                </div>
              </CardHeader>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/50 px-3 py-2">
                {toolbarButtons.map((btn, index) => {
                  if ("type" in btn && btn.type === "divider") {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="mx-2 h-6 w-px bg-border"
                      />
                    );
                  }
                  const iconBtn = btn as ToolbarButton;
                  return (
                    <button
                      key={iconBtn.title}
                      onClick={() => toggleToolbar(iconBtn.title)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md",
                        "transition-all",
                        activeToolbar.has(iconBtn.title)
                          ? "bg-primary/10 text-primary"
                          : [
                              "text-muted",
                              "hover:bg-secondary hover:text-foreground",
                            ]
                      )}
                      title={iconBtn.title}
                    >
                      <iconBtn.icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
              {/* Content Area */}
              <CardContent className="p-0">
                <div
                  ref={contentRef}
                  contentEditable
                  onInput={(e) => {
                    setContent(e.currentTarget.textContent || "");
                    updateWordCount();
                  }}
                  className={cn(
                    "min-h-96 bg-secondary p-4 font-serif text-base",
                    "leading-relaxed text-foreground outline-none",
                    "empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
                  )}
                  data-placeholder="Start writing your article..."
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Excerpt Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardHeader className="border-b border-border px-6 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <svg
                    className="h-4 w-4 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Excerpt
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write a short summary of your article..."
                  className="min-h-24 resize-y"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Editor Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Publish Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-6"
          >
            <Card>
              <CardContent className="p-6">
                {/* Status */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary capitalize">
                    {publishStatus}
                  </span>
                </div>

                {/* Autosave Indicator */}
                <div className="mb-4 flex items-center gap-2 text-xs text-muted">
                  {autosaveStatus === "saved" && (
                    <>
                      <Cloud className="h-3.5 w-3.5" />
                      <span>All changes saved</span>
                    </>
                  )}
                  {autosaveStatus === "saving" && (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {autosaveStatus === "offline" && (
                    <>
                      <CloudOff className="h-3.5 w-3.5" />
                      <span>Offline - changes not saved</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={handleSaveDraft} className="w-full">
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category & Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                {/* Category */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      if (value !== null) {
                        setCategory(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Design Systems</SelectItem>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="ai">AI & Machine Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Tags
                  </label>
                  <div
                    className={cn(
                      "flex min-h-11 flex-wrap gap-2 rounded-lg border",
                      "border-input bg-secondary p-3"
                    )}
                  >
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full",
                          "bg-primary/10 px-2 py-1 text-xs text-primary"
                        )}
                      >
                        {tag.name}
                        <button
                          onClick={() => removeTag(tag.id)}
                          className={cn(
                            "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                            "hover:bg-primary hover:text-white"
                          )}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tags..."
                      className={cn(
                        "min-w-20 flex-1 bg-transparent text-sm",
                        "text-foreground outline-none",
                        "placeholder:text-muted"
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* URL Slug */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    URL Slug
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="article-url-slug"
                    className="font-mono text-xs"
                  />
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-secondary px-3 py-2">
                    <span className="text-xs text-muted">superblog.dev/</span>
                    <code className="text-xs text-primary">{slug || "article-url-slug"}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Featured */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Featured Article
                  </label>
                  <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                    <span className="text-sm text-muted">Mark as featured</span>
                    <button
                      onClick={() => setFeatured(!featured)}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        featured ? "bg-primary" : "bg-border"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                          featured ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
