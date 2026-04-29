import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { FeaturedPosts } from "@/components/featured-posts";
import { Hero } from "@/components/hero";
import { RecentPosts } from "@/components/recent-posts";

import {
  getCachedFeaturedBlogs,
  getCachedRecentBlogs,
} from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

export default async function Page() {
  const settingsPromise = getCachedSiteSettings();
  const featuredBlogsPromise = getCachedFeaturedBlogs();
  const recentBlogsPromise = getCachedRecentBlogs();
  const { settings } = await settingsPromise;

  return (
    <>
      <Hero settings={settings} />
      <Suspense fallback={<FeaturedPostsSkeleton />}>
        <FeaturedPostsContent blogsPromise={featuredBlogsPromise} />
      </Suspense>
      <Suspense fallback={<RecentPostsSkeleton />}>
        <RecentPostsContent blogsPromise={recentBlogsPromise} />
      </Suspense>
    </>
  );
}

async function FeaturedPostsContent({
  blogsPromise,
}: {
  blogsPromise: ReturnType<typeof getCachedFeaturedBlogs>;
}) {
  const { items } = await blogsPromise;

  return <FeaturedPosts posts={items} />;
}

async function RecentPostsContent({
  blogsPromise,
}: {
  blogsPromise: ReturnType<typeof getCachedRecentBlogs>;
}) {
  const { items } = await blogsPromise;

  return <RecentPosts posts={items} />;
}

function FeaturedPostsSkeleton() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
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
      </div>
    </section>
  );
}

function RecentPostsSkeleton() {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex flex-col">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-4 ${
                index !== 4 ? "border-b border-border" : ""
              }`}
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
