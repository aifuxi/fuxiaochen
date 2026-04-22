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

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicBlog } from "@/lib/server/blogs/mappers";
import type { PublicCategory } from "@/lib/server/categories/mappers";
import type { PublicTag } from "@/lib/server/tags/mappers";

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
        <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
          Blog
        </h1>
        <p className="text-muted-foreground text-lg">
          Thoughts on web development, design, and building great products.
        </p>
      </header>

      <div className="mb-10 flex flex-col gap-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search articles by title, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
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
              className="text-muted-foreground gap-1"
            >
              <X className="size-3" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <p className="text-muted-foreground mb-6 text-sm">
        {filteredPosts.length}{" "}
        {filteredPosts.length === 1 ? "article" : "articles"} found
      </p>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group border-border bg-card hover:bg-accent/50 flex flex-col overflow-hidden rounded-lg border transition-colors"
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
                  <span className="text-muted-foreground text-xs">
                    {post.readTime}
                  </span>
                </div>
                <h2 className="text-foreground group-hover:text-foreground/90 font-semibold text-balance">
                  {post.title}
                </h2>
                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                  {post.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-muted-foreground text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                <time className="text-muted-foreground text-xs">
                  {post.date}
                </time>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-foreground mb-2 text-lg font-medium">
            No articles found
          </p>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </main>
  );
}
