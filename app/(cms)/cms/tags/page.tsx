import { CmsShell } from "@/components/layout/cms-shell";
import { taxonomyRows } from "@/lib/mocks/cms-content";

const tagCards = [
  ...taxonomyRows,
  { label: "JavaScript", usage: "22 articles", tone: "warning" },
  { label: "Next.js", usage: "16 articles", tone: "primary" },
  { label: "Open Source", usage: "7 articles", tone: "info" },
  { label: "Performance", usage: "5 articles", tone: "warning" },
  { label: "Accessibility", usage: "4 articles", tone: "primary" },
];

export default function CmsTagsPage() {
  return (
    <CmsShell description="Manage lightweight labels as reusable content facets." title="Tags">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-80">
          <input className="search-input w-full rounded-xl py-3 pr-4 pl-12 text-sm text-white" placeholder="Search tags..." />
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-muted">⌕</span>
        </div>
        <button className="btn-primary-glow rounded-xl px-4 py-3 text-sm font-semibold">Add Tag</button>
      </div>

      <div className={`
        grid gap-6
        sm:grid-cols-2
        lg:grid-cols-4
        xl:grid-cols-5
      `}>
        {tagCards.map((tag, index) => (
          <div key={`${tag.label}-${index}`} className={`
            glass-card rounded-2xl border border-white/8 p-6 transition-all
            hover:-translate-y-1 hover:border-white/15
          `}>
            <div className="font-mono-tech mb-3 text-base font-semibold text-foreground">#{tag.label}</div>
            <div className="mb-5 text-xs text-muted">{tag.usage}</div>
            <div className="flex gap-2">
              <button className={`
                rounded-lg border border-white/8 bg-white/4 px-3 py-1 text-xs text-foreground transition
                hover:border-primary hover:text-primary
              `}>Edit</button>
              <button className={`
                rounded-lg border border-white/8 bg-white/4 px-3 py-1 text-xs text-foreground transition
                hover:border-red-500 hover:text-red-400
              `}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </CmsShell>
  );
}
