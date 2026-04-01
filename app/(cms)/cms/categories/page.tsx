import { CmsShell } from "@/components/layouts/cms-shell";
import { taxonomyRows } from "@/lib/mock/design-content";

export default function CmsCategoriesPage() {
  return (
    <CmsShell
      currentPath="/cms/categories"
      description="Taxonomy pages are present so the route map now matches the design spec."
      title="Categories"
    >
      <section className="space-y-6">
        <div className="cms-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input className={`
              h-10 min-w-64 rounded-md border border-border bg-surface px-4 text-sm text-fg outline-none
              placeholder:text-muted
              focus:border-primary
            `} placeholder="Search categories..." />
            <button type="button" className={`
              ml-auto rounded-md bg-primary px-4 py-2 font-medium text-primary-fg transition-colors
              hover:bg-primary-h
            `}>
              Add category
            </button>
          </div>
        </div>
        <div className="cms-card overflow-hidden">
          <div className={`
            grid grid-cols-[1.5fr_120px_160px_120px] border-b border-border bg-bg-elevated/70 px-6 py-4 font-mono
            text-[11px] tracking-[0.16em] text-muted uppercase
          `}>
            <span>Name</span>
            <span>Articles</span>
            <span>Updated</span>
            <span>Status</span>
          </div>
          {taxonomyRows.map((row) => (
            <div key={row.name} className={`
              grid grid-cols-[1.5fr_120px_160px_120px] items-center border-b border-border/80 px-6 py-5 text-sm
              last:border-b-0
            `}>
              <span className="font-medium text-fg">{row.name}</span>
              <span className="text-muted">{row.count}</span>
              <span className="text-muted">{row.updated}</span>
              <span className={`
                inline-flex w-fit rounded-full bg-primary/12 px-3 py-1 font-mono text-[11px] tracking-[0.16em]
                text-primary uppercase
              `}>
                Active
              </span>
            </div>
          ))}
        </div>
      </section>
    </CmsShell>
  );
}
