import { PortraitArtwork } from "@/components/editorial-artwork";
import {
  EditorialShell,
  MetaText,
  SectionEyebrow,
} from "@/components/editorial-shell";

import { aboutFocusAreas, editorialSite } from "@/lib/content/editorial";

export const metadata = {
  title: "About",
  description:
    "A static about page for the editorial-style system and its frontend design focus.",
};

export default function AboutPage() {
  return (
    <EditorialShell current="about" footerWidth="page">
      <main className="shell-page pt-32 pb-24">
        <header className="mb-24 md:ml-auto md:w-2/3">
          <SectionEyebrow className="mb-6">
            {editorialSite.title}
          </SectionEyebrow>
          <h1 className="text-5xl font-bold tracking-[-0.06em] text-text-strong md:text-[4.5rem] md:leading-[0.98]">
            Observing the intersection of design, technology, and human
            experience.
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <section className="ui-panel p-8 md:col-span-8 md:p-12">
            <h2 className="text-title-lg font-semibold tracking-[-0.04em] text-text-strong">
              Biography
            </h2>
            <div className="mt-6 space-y-6 text-lg leading-8 text-text-base">
              <p>
                {editorialSite.author} is a frontend engineer and interface
                editor focused on translating calm, high-contrast visual systems
                into reusable code. The work usually starts with typography and
                spacing, then moves outward into surface hierarchy and
                interaction detail.
              </p>
              <p>
                This static implementation adapts the template language into a
                route-based Next.js site with shared Tailwind v4 utilities,
                composable layout primitives, and a restrained editorial rhythm.
              </p>
            </div>
          </section>

          <div className="overflow-hidden ui-panel md:col-span-4">
            <PortraitArtwork className="min-h-[320px] rounded-none" />
          </div>

          <section className="ui-panel ui-panel-hover p-8 md:col-span-6 md:p-12">
            <h2 className="text-title-lg font-semibold tracking-[-0.04em] text-text-strong">
              Areas of Focus
            </h2>
            <ul className="mt-8 space-y-6">
              {aboutFocusAreas.map((area) => (
                <li key={area.title} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 rounded-full bg-brand"
                  />
                  <div>
                    <h3 className="text-title font-semibold tracking-[-0.03em] text-text-strong">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-base">
                      {area.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="ui-panel p-8 md:col-span-6 md:p-12">
            <h2 className="text-title-lg font-semibold tracking-[-0.04em] text-text-strong">
              Connect
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-text-base">
              I am open to conversations about design systems, long-form content
              experiences, and frontend architecture that benefits from a calmer
              visual language.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={`mailto:${editorialSite.email}`}
                className="group ui-action-row"
              >
                <span className="font-mono text-sm tracking-[0.16em] text-text-strong transition-colors duration-300 group-hover:text-brand">
                  {editorialSite.email}
                </span>
                <span className="text-text-soft transition-colors duration-300 group-hover:text-brand">
                  /
                </span>
              </a>
              {editorialSite.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  rel="noreferrer"
                  target="_blank"
                  className="group ui-action-row"
                >
                  <span className="font-mono text-sm tracking-[0.16em] text-text-strong transition-colors duration-300 group-hover:text-brand">
                    {social.label}
                  </span>
                  <MetaText className="transition-colors duration-300 group-hover:text-brand">
                    Open
                  </MetaText>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </EditorialShell>
  );
}
