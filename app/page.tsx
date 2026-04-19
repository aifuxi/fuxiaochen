import Link from "next/link";

import { HaloGlyph, TopographyArtwork } from "@/components/editorial-artwork";
import {
  EditorialShell,
  MetaText,
  SectionEyebrow,
} from "@/components/editorial-shell";

import { editorialPosts, editorialSite } from "@/lib/content/editorial";

export const metadata = {
  title: "Home",
  description:
    "Editorial-style home page built from the template direction with quiet surfaces, restrained typography, and static content.",
};

const featuredPost = editorialPosts[0];
const cardPost = editorialPosts[3];
const essayPost = editorialPosts[1];

export default function HomePage() {
  if (!featuredPost || !cardPost || !essayPost) {
    return null;
  }

  return (
    <EditorialShell current="home">
      <main className="shell-measure space-y-32 pt-32 pb-24">
        <section className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-8 md:col-start-2">
            <SectionEyebrow className="mb-4">Introduction</SectionEyebrow>
            <h1 className="max-w-4xl text-5xl font-extrabold tracking-[-0.06em] text-text-strong md:text-[4.5rem] md:leading-[0.98]">
              Hi, I&apos;m {editorialSite.author}. A digital craftsman curating
              artifacts in code and interface systems.
            </h1>
            <p className="mt-8 max-w-2xl text-body-lg text-text-base">
              Exploring the intersection of frontend systems, editorial layout,
              and quiet interaction design. This space collects static studies,
              implementation notes, and experiments that respect the
              reader&apos;s attention.
            </p>
            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-2 font-mono text-sm tracking-[0.18em] text-brand uppercase transition-colors duration-300 hover:text-brand-soft"
            >
              Read the manifesto
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </section>

        <section className="space-y-12">
          <div className="flex items-end justify-between gap-6 pl-0 md:pl-12">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-text-strong">
              Recent Experiments
            </h2>
            <Link href="/posts" className="ui-eyebrow ui-link">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:auto-rows-[minmax(300px,auto)] md:grid-cols-12">
            <Link
              href={`/posts/${featuredPost.slug}`}
              className="relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden ui-panel ui-panel-hover p-8 md:col-span-8 md:p-12"
            >
              <TopographyArtwork className="absolute inset-0 rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/50 to-transparent" />
              <div className="relative z-10">
                <MetaText className="mb-3 block text-brand">
                  Case Study
                </MetaText>
                <h3 className="text-title-lg font-semibold tracking-[-0.04em] text-white">
                  {featuredPost.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-text-base">
                  {featuredPost.summary}
                </p>
              </div>
            </Link>

            <Link
              href={`/posts/${cardPost.slug}`}
              className="flex flex-col justify-between ui-panel ui-panel-hover p-8 md:col-span-4"
            >
              <div className="flex justify-end text-text-muted">{"<>"}</div>
              <div>
                <MetaText className="mb-2 block text-accent-rose">
                  Component
                </MetaText>
                <h3 className="text-title font-medium tracking-[-0.03em] text-text-strong">
                  Ghost Buttons
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-base">
                  A study in tactile secondary actions built from lithographic
                  edges and active-state feedback.
                </p>
              </div>
            </Link>

            <Link
              href={`/posts/${essayPost.slug}`}
              className="flex flex-col justify-between ui-panel ui-panel-hover p-8 md:col-span-5"
            >
              <div className="flex justify-end text-text-muted">+</div>
              <div>
                <MetaText className="mb-2 block text-accent-rose">
                  Essay
                </MetaText>
                <h3 className="text-title font-medium tracking-[-0.03em] text-text-strong">
                  Typography in the Void
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-base">
                  How a restrained mono font can lower the temperature of system
                  metadata without losing clarity.
                </p>
              </div>
            </Link>

            <Link
              href="/changelog"
              className="relative flex items-center gap-8 overflow-hidden ui-panel ui-panel-hover p-8 md:col-span-7"
            >
              <div className="flex-1">
                <MetaText className="mb-2 block">Lab</MetaText>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.04em] text-text-strong">
                  Tonal Hierarchies
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-text-base">
                  A changelog of iterations around surface tokens, typography
                  rhythm, and dark-mode editorial composition.
                </p>
              </div>
              <HaloGlyph className="hidden md:flex" />
            </Link>
          </div>
        </section>
      </main>
    </EditorialShell>
  );
}
