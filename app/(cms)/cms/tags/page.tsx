import { CmsShell } from "@/components/layouts/cms-shell";
import { tagRows } from "@/lib/mock/design-content";

export default function CmsTagsPage() {
  return (
    <CmsShell
      currentPath="/cms/tags"
      description="Tag management is scaffolded as a first-class CMS route."
      title="Tags"
    >
      <section className="space-y-6">
        <div className="cms-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input className={`
              h-10 min-w-64 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
              placeholder:text-muted
              focus:border-primary
            `} placeholder="Search tags..." />
            <button type="button" className={`
              ml-auto rounded-md bg-primary px-4 py-2 font-medium text-primary-fg transition-colors
              hover:bg-primary-h
            `}>
              Add tag
            </button>
          </div>
        </div>
        <div className={`
          grid gap-4
          md:grid-cols-2
          xl:grid-cols-4
        `}>
          {tagRows.map((row) => (
            <div key={row.name} className="cms-card p-5">
              <div className={`
                mb-4 inline-flex rounded-full bg-white/8 px-3 py-1 font-mono text-[11px] tracking-[0.16em] text-muted
                uppercase
              `}>
                #{row.name}
              </div>
              <div className="font-mono text-3xl text-fg">{row.count}</div>
              <div className="mt-1 text-sm text-muted">articles using this tag</div>
              <div className="mt-5 text-xs text-muted">Updated {row.updated}</div>
            </div>
          ))}
        </div>
      </section>
    </CmsShell>
  );
}
