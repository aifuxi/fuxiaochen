import { Suspense } from "react";

import { type Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";

import { getCachedPublicBlogPageData } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { siteCopy } from "@/constants/site-copy";

import { BlogListClient } from "./blog-list-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.blog;
}

export default function BlogListPage() {
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

      <Suspense fallback={<BlogListSkeleton />}>
        <BlogListContent />
      </Suspense>
    </main>
  );
}

async function BlogListContent() {
  const { items, categories, tags } = await getCachedPublicBlogPageData();

  return (
    <BlogListClient
      initialBlogs={items}
      initialCategories={categories}
      initialTags={tags}
    />
  );
}

function BlogListSkeleton() {
  return (
    <>
      <div className="mb-10 flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <Skeleton className="mb-6 h-5 w-24" />
      <div className="grid gap-8 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <Skeleton className="aspect-[16/9] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
