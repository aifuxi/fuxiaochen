"use client";

import { useState } from "react";

import Link from "next/link";

import { Search, X } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BlogCoverImage } from "@/components/blog-cover-image";
import { BlogStats } from "@/components/blog-stats";

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicBlog } from "@/lib/server/blogs/mappers";
import type { PublicCategory } from "@/lib/server/categories/mappers";
import type { PublicTag } from "@/lib/server/tags/mappers";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

type BlogListClientProps = {
  initialBlogs?: PublicBlog[];
  initialCategories?: PublicCategory[];
  initialTags?: PublicTag[];
};

export function BlogListClient({
  initialBlogs,
  initialCategories,
  initialTags,
}: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const { data: blogsData } = useSWR<{ items: PublicBlog[] }>(
    "/api/public/blogs?pageSize=100",
    fetchApiData,
    {
      fallbackData: {
        items: initialBlogs ?? [],
      },
      revalidateOnFocus: false,
    },
  );
  const { data: categoriesData } = useSWR<{ items: PublicCategory[] }>(
    "/api/public/categories",
    fetchApiData,
    {
      fallbackData: {
        items: initialCategories ?? [],
      },
      revalidateOnFocus: false,
    },
  );
  const { data: tagsData } = useSWR<{ items: PublicTag[] }>(
    "/api/public/tags",
    fetchApiData,
    {
      fallbackData: {
        items: initialTags ?? [],
      },
      revalidateOnFocus: false,
    },
  );

  const blogs = blogsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const tags = tagsData?.items ?? [];

  const filteredPosts = blogs.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    const matchesTag = selectedTag === "all" || post.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTag("all");
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedCategory !== "all" || selectedTag !== "all";

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          {siteCopy.blogList.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {siteCopy.blogList.description}
        </p>
      </header>

      <div className="mb-10 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={siteCopy.blogList.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue
                placeholder={siteCopy.blogList.categoryPlaceholder}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {siteCopy.blogList.categoryAll}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={siteCopy.blogList.tagPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{siteCopy.blogList.tagAll}</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.slug} value={tag.slug}>
                  {tag.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="size-3" />
              {siteCopy.blogList.clearFilters}
            </Button>
          )}
        </div>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {siteCopy.blogList.resultCount(filteredPosts.length)}
      </p>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={routes.site.blogPost(post.slug)}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-accent/50"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <BlogCoverImage
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {post.readTime}
                  </span>
                </div>
                <BlogStats
                  viewCount={post.viewCount}
                  likeCount={post.likeCount}
                  liked={post.liked}
                />
                <h2 className="font-semibold text-balance text-foreground group-hover:text-foreground/90">
                  {post.title}
                </h2>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
                <time className="text-xs text-muted-foreground">
                  {post.date}
                </time>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="mb-2 text-lg font-medium text-foreground">
            {siteCopy.blogList.emptyTitle}
          </p>
          <p className="mb-4 text-muted-foreground">
            {siteCopy.blogList.emptyDescription}
          </p>
          <Button variant="outline" onClick={clearFilters}>
            {siteCopy.blogList.clearAllFilters}
          </Button>
        </div>
      )}
    </main>
  );
}
