import { EditorialShell, MetaText } from "@/components/editorial-shell";

import { changelogEntries } from "@/lib/content/editorial";

export const metadata = {
  title: "Changelog",
  description:
    "A static changelog for design system refinements, layout shifts, and typography iterations.",
};

export default function ChangelogPage() {
  return (
    <EditorialShell current="changelog" footerWidth="page">
      <main className="shell-page flex flex-col gap-24 pt-32 pb-24">
        <header className="max-w-2xl">
          <h1 className="text-display-2 font-light tracking-[-0.06em] text-text-strong md:text-[4.5rem]">
            Changelog
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-text-base">
            A chronicle of updates, iterations, and refinements to the digital
            archive. Building with quiet intention rather than visual noise.
          </p>
        </header>

        <section className="flex flex-col gap-16">
          {changelogEntries.map((entry) => (
            <article
              key={entry.version}
              className="flex flex-col gap-6 md:flex-row md:gap-16"
            >
              <aside className="md:w-48 md:shrink-0">
                <MetaText className="mb-2 block text-brand">
                  {entry.version}
                </MetaText>
                <MetaText>{entry.dateLabel}</MetaText>
              </aside>

              <div className="flex-1 ui-panel ui-panel-hover p-8">
                <h2 className="text-title-lg font-medium tracking-[-0.04em] text-text-strong">
                  {entry.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-text-base">
                  {entry.summary}
                </p>
                <ul className="mt-6 space-y-3">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.4rem] h-1.5 w-1.5 rounded-full bg-brand"
                      />
                      <span className="text-base leading-7 text-text-base">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      </main>
    </EditorialShell>
  );
}
