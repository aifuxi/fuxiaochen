import { CmsShell } from "@/components/layout/cms-shell";
import { taxonomyRows } from "@/lib/mocks/cms-content";

export default function CmsCategoriesPage() {
  return (
    <CmsShell description="Organize article collections with colors, counts, and quick taxonomy maintenance." title="Categories">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-sm text-foreground">Bulk Actions</button>
          <button className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-sm text-foreground">Sort: Usage</button>
        </div>
        <button className="btn-primary-glow rounded-xl px-4 py-3 text-sm font-semibold">New Category</button>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/2 text-left">
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Category</th>
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Usage</th>
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Tone</th>
              <th className="font-mono-tech px-6 py-4 text-xs tracking-[0.05em] text-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxonomyRows.map((row, index) => (
              <tr key={row.label} className={`
                border-t border-white/8 transition
                hover:bg-white/4
              `}>
                <td className="px-6 py-5 text-sm">
                  <span className={`
                    mr-3 inline-block h-3 w-3 rounded-full
                    ${index === 0 ? "bg-primary" : index === 1 ? `bg-amber-400` : `bg-sky-400`}
                  `} />
                  {row.label}
                </td>
                <td className="px-6 py-5 text-sm text-muted">{row.usage}</td>
                <td className="px-6 py-5">
                  <span className={`
                    rounded-full px-3 py-1 text-xs
                    ${index === 0 ? "bg-primary/15 text-primary" : index === 1 ? `bg-amber-500/15 text-amber-400` : `
                      bg-sky-500/15 text-sky-400
                    `}
                  `}>
                    {row.tone}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-muted">Edit · Delete</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CmsShell>
  );
}
