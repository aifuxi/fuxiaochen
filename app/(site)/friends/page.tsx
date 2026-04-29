import { Suspense } from "react";

import { type Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";

import { getCachedPublicFriends } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { FriendsPageClient } from "./friends-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.friends;
}

export default async function FriendsPage() {
  const settingsPromise = getCachedSiteSettings();
  const friendsPromise = getCachedPublicFriends();
  const { settings } = await settingsPromise;

  return (
    <Suspense fallback={<FriendsPageSkeleton />}>
      <FriendsPageContent friendsPromise={friendsPromise} settings={settings} />
    </Suspense>
  );
}

async function FriendsPageContent({
  friendsPromise,
  settings,
}: {
  friendsPromise: ReturnType<typeof getCachedPublicFriends>;
  settings: Awaited<ReturnType<typeof getCachedSiteSettings>>["settings"];
}) {
  const { items } = await friendsPromise;

  return <FriendsPageClient friends={items} settings={settings} />;
}

function FriendsPageSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-16 text-center">
        <Skeleton className="mx-auto h-10 w-32" />
        <Skeleton className="mx-auto mt-4 h-6 w-full max-w-xl" />
      </header>
      <div className="space-y-12">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <section key={sectionIndex}>
            <Skeleton className="mb-6 h-5 w-24" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <Skeleton className="size-12 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
