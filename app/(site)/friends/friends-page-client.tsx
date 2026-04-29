import Link from "next/link";

import { ExternalLink, User } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PublicFriend } from "@/lib/server/friends/mappers";
import type { SiteSettings } from "@/lib/settings/types";

import { siteCopy } from "@/constants/site-copy";

type FriendsPageClientProps = {
  friends: PublicFriend[];
  settings: SiteSettings;
};

function getCategoryLabel(category: PublicFriend["category"]) {
  return siteCopy.friends.categories[category];
}

export function FriendsPageClient({
  friends,
  settings,
}: FriendsPageClientProps) {
  const groupedFriends = friends.reduce(
    (acc, friend) => {
      if (!acc[friend.category]) {
        acc[friend.category] = [];
      }
      acc[friend.category].push(friend);
      return acc;
    },
    {} as Record<PublicFriend["category"], PublicFriend[]>,
  );
  const categoryOrder: PublicFriend["category"][] = [
    "developer",
    "designer",
    "blogger",
    "creator",
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
          {siteCopy.friends.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {siteCopy.friends.description}
        </p>
      </header>

      {friends.length > 0 ? (
        <div className="space-y-12">
          {categoryOrder.map((category) => {
            const categoryFriends = groupedFriends[category];
            if (!categoryFriends || categoryFriends.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="mb-6 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                  {getCategoryLabel(category)}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {categoryFriends.map((friend) => (
                    <Link
                      key={friend.id}
                      href={friend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                    >
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="size-12 flex-shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="size-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium text-foreground group-hover:text-primary">
                            {friend.name}
                          </span>
                          <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {friend.description}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground/70">
                          {friend.url.replace(/^https?:\/\//, "")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-lg font-medium text-foreground">
            {siteCopy.friends.emptyTitle}
          </p>
          <p className="mt-2 text-muted-foreground">
            {siteCopy.friends.emptyDescription}
          </p>
        </div>
      )}

      <div className="mt-16 rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          {siteCopy.friends.ctaTitle}
        </h2>
        <p className="mb-4 text-muted-foreground">
          {siteCopy.friends.ctaDescription}
        </p>
        <Button asChild>
          <Link href={`mailto:${settings.general.email}`}>
            {siteCopy.friends.ctaAction}
          </Link>
        </Button>
      </div>
    </main>
  );
}
