import Link from "next/link";

import { EditorialShell, MetaText } from "@/components/editorial-shell";

import { editorialPosts } from "@/lib/content/editorial";

export const metadata = {
  title: "Posts",
  description:
    "An index of static editorial studies and frontend system notes.",
};

const archiveYears = ["2024", "2023", "2022"];

export default function PostsPage() {
  return (
    <EditorialShell current="posts">
      <main className="shell-measure flex flex-col gap-16 pt-32 pb-24 md:flex-row">
        <aside className="hidden w-40 shrink-0 md:block">
          <div className="sticky top-32">
            <MetaText className="mb-4 block">Archive</MetaText>
            <ul className="space-y-3">
              {archiveYears.map((year) => (
                <li key={year}>
                  <span className="cursor-default ui-meta ui-link">{year}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-20">
            <h1 className="text-display-2 font-bold tracking-[-0.06em] text-text-strong md:text-[4.5rem]">
              Index
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-text-base">
              A chronological record of essays, pattern notes, and interface
              studies focused on frontend systems, typography, and calm digital
              experiences.
            </p>
          </header>

          <div className="space-y-12">
            {editorialPosts.map((post) => (
              <article
                key={post.slug}
                className="group relative ui-row-hover flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8"
              >
                <div className="md:w-32 md:shrink-0">
                  <time dateTime={post.date} className="ui-meta text-text-soft">
                    {post.dateLabel}
                  </time>
                </div>
                <div className="min-w-0">
                  <h2 className="text-title font-medium tracking-[-0.03em] text-text-strong transition-colors duration-300 group-hover:text-brand">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="before:absolute before:inset-0"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {post.listLabels.map((label) => (
                      <MetaText key={label}>{label}</MetaText>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-24 flex items-center justify-between ui-divider pt-8">
            <span className="ui-meta text-text-muted">Newer</span>
            <span className="ui-meta text-text-soft">1 / 1</span>
            <span className="ui-meta text-text-muted">Older</span>
          </div>
        </section>
      </main>
    </EditorialShell>
  );
}
