import { PageIntro } from "@/components/blocks/page-intro";
import { Card } from "@/components/ui/card";
import { changelogEntries } from "@/lib/mocks/site-content";

export default function ChangelogPage() {
  return (
    <>
      <PageIntro
        description="A chronological view of the system shape as the public site and CMS move from structure to implementation."
        eyebrow="Changelog"
        title="System milestones and interface revisions."
      />
      <section className="shell-container space-y-5">
        {changelogEntries.map((entry) => (
          <Card key={entry.version} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="mb-2 type-label">{entry.date}</div>
                <h2 className="font-serif text-4xl tracking-[-0.05em]">{entry.version}</h2>
              </div>
              <div className="max-w-xl text-sm text-muted">{entry.title}</div>
            </div>
            <ul className="space-y-2 text-sm leading-6 text-muted">
              {entry.changes.map((change) => (
                <li key={change}>• {change}</li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </>
  );
}
