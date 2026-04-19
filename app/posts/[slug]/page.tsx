import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  LightBeamArtwork,
  TopographyArtwork,
} from "@/components/editorial-artwork";
import {
  EditorialShell,
  MetaText,
  TagPill,
} from "@/components/editorial-shell";

import { editorialPosts, getEditorialPost } from "@/lib/content/editorial";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return editorialPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getEditorialPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getEditorialPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <EditorialShell current="posts">
      <main className="shell-reading pt-32 pb-24">
        <header className="mb-16">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <MetaText className="text-accent-rose">{post.category}</MetaText>
            <MetaText className="text-text-muted">/</MetaText>
            <MetaText>{post.dateLabel}</MetaText>
          </div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.06em] text-white md:text-[4rem] md:leading-[1.02]">
            {post.title}
          </h1>
          <p className="mt-8 max-w-2xl text-[1.35rem] leading-9 text-text-base">
            {post.excerpt}
          </p>
          <div className="mt-12 overflow-hidden rounded-panel border border-white/6">
            {post.hero === "beam" ? (
              <LightBeamArtwork className="aspect-[21/9] w-full rounded-none" />
            ) : (
              <TopographyArtwork className="aspect-[21/9] w-full rounded-none" />
            )}
          </div>
        </header>

        <article className="prose-editorial">
          {post.sections.map((section) => (
            <section
              key={`${section.heading ?? "section"}-${section.paragraphs.join("-").slice(0, 32)}`}
            >
              {section.heading ? <h2>{section.heading}</h2> : null}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          {post.quote ? (
            <section>
              <blockquote>{post.quote}</blockquote>
            </section>
          ) : null}

          {post.codeSample ? (
            <section className="mt-10 overflow-hidden ui-panel-elevated rounded-panel p-8">
              <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-4">
                <MetaText>surface-hierarchy.css</MetaText>
                <span className="ui-meta text-brand">Copy</span>
              </div>
              <pre className="overflow-x-auto font-mono text-sm leading-7 text-text-base">
                <code className="bg-transparent p-0 text-inherit">
                  {post.codeSample}
                </code>
              </pre>
            </section>
          ) : null}

          {post.compare ? (
            <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="ui-panel p-8">
                <MetaText className="mb-4 block text-accent-rose">
                  Old Way
                </MetaText>
                <h3 className="text-title font-semibold tracking-[-0.03em] text-white">
                  Hard Separation
                </h3>
                <p className="mt-3 text-base leading-7 text-text-base">
                  {post.compare.oldWay}
                </p>
              </div>
              <div className="ui-panel-elevated ui-surface-glow p-8">
                <MetaText className="mb-4 block">New Way</MetaText>
                <h3 className="text-title font-semibold tracking-[-0.03em] text-white">
                  Tonal Depth
                </h3>
                <p className="mt-3 text-base leading-7 text-text-base">
                  {post.compare.newWay}
                </p>
              </div>
            </section>
          ) : null}
        </article>

        <footer className="mt-20 ui-divider pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag) => (
                <TagPill key={tag}>{tag}</TagPill>
              ))}
            </div>
            <Link href="/posts" className="ui-meta ui-link">
              Back to index
            </Link>
          </div>
        </footer>
      </main>
    </EditorialShell>
  );
}
