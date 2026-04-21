import { type Metadata } from "next";
import Link from "next/link";

import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { getAllFriends, type Friend } from "@/lib/friends-data";

export const metadata: Metadata = {
  title: "Friends | Fuxiaochen",
  description: "Links to my friends and people whose work I admire.",
};

function getCategoryLabel(category: Friend["category"]) {
  const labels = {
    developer: "Developer",
    designer: "Designer",
    blogger: "Blogger",
    creator: "Creator",
  };
  return labels[category];
}

export default function FriendsPage() {
  const friends = getAllFriends();

  const groupedFriends = friends.reduce(
    (acc, friend) => {
      if (!acc[friend.category]) {
        acc[friend.category] = [];
      }
      acc[friend.category].push(friend);
      return acc;
    },
    {} as Record<Friend["category"], Friend[]>,
  );

  const categoryOrder: Friend["category"][] = [
    "developer",
    "designer",
    "blogger",
    "creator",
  ];

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
            Friends
          </h1>
          <p className="text-muted-foreground text-lg">
            Links to my friends and people whose work I admire. Check out their
            amazing blogs and projects.
          </p>
        </header>

        {/* Friends Grid by Category */}
        <div className="space-y-12">
          {categoryOrder.map((category) => {
            const categoryFriends = groupedFriends[category];
            if (!categoryFriends || categoryFriends.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="text-muted-foreground mb-6 text-sm font-medium tracking-wider uppercase">
                  {getCategoryLabel(category)}s
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {categoryFriends.map((friend) => (
                    <Link
                      key={friend.id}
                      href={friend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group border-border bg-card hover:bg-accent flex items-start gap-4 rounded-lg border p-4 transition-colors"
                    >
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="size-12 flex-shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-foreground group-hover:text-primary font-medium">
                            {friend.name}
                          </span>
                          <ExternalLink className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {friend.description}
                        </p>
                        <p className="text-muted-foreground/70 mt-2 text-xs">
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

        {/* CTA */}
        <div className="border-border bg-card mt-16 rounded-lg border p-8 text-center">
          <h2 className="text-foreground mb-2 text-xl font-semibold">
            Want to exchange links?
          </h2>
          <p className="text-muted-foreground mb-4">
            If you have a blog or portfolio and would like to be featured here,
            feel free to reach out!
          </p>
          <Badge variant="secondary" className="hover:bg-accent cursor-pointer">
            Contact me
          </Badge>
        </div>
      </main>

      <Footer />
    </div>
  );
}
