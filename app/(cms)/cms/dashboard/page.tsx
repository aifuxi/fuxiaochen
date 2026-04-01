import { CmsShell } from "@/components/layouts/cms-shell";
import { StatsGrid } from "@/components/cms/stats-grid";
import { dashboardStats } from "@/lib/mock/design-content";

export default function CmsDashboardPage() {
  return (
    <CmsShell
      currentPath="/cms/dashboard"
      description="Shared admin shell for metrics, operational surfaces and quick publishing flows."
      title="Dashboard"
    >
      <div className="space-y-6">
        <StatsGrid items={[...dashboardStats]} />
        <div className={`
          grid gap-6
          xl:grid-cols-[1.3fr_0.9fr]
        `}>
          <section className="cms-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-[2rem] font-medium tracking-[-0.04em] text-fg">
                  Recent activity
                </h2>
                <p className="mt-1 text-sm text-muted">Latest editorial events and review status.</p>
              </div>
              <button type="button" className="font-mono text-[11px] tracking-[0.16em] text-primary uppercase">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[
                "Alex published “Building a Scalable Design System”",
                "3 new comments waiting moderation",
                "SEO settings updated on the public site",
                "Mina requested review on a draft article",
              ].map((item, index) => (
                <div key={item} className={`
                  flex items-start gap-4 rounded-xl border border-white/8 px-4 py-4 transition-colors
                  hover:bg-white/3
                `}>
                  <div className="mt-1 size-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="text-sm text-fg">{item}</div>
                    <div className="mt-1 text-xs text-muted">{12 + index * 18} min ago</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="cms-card p-6">
            <div className="mb-6">
              <h2 className="font-serif text-[2rem] font-medium tracking-[-0.04em] text-fg">
                Quick actions
              </h2>
              <p className="mt-1 text-sm text-muted">Entry points for daily publishing work.</p>
            </div>
            <div className="grid gap-3">
              {[
                "Create new article",
                "Review pending comments",
                "Manage tags and categories",
                "Open analytics report",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`
                    rounded-xl border border-white/8 bg-white/2 px-4 py-4 text-left text-sm text-fg transition-colors
                    hover:bg-white/4
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className={`
          grid gap-6
          xl:grid-cols-[1.1fr_0.9fr]
        `}>
          <section className="cms-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Top performing articles</h2>
              <span className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Last 30 days</span>
            </div>
            <div className="space-y-4">
              {[
                ["Building a Scalable Design System with CSS Custom Properties", "2,847 views"],
                ["Designing Editorial Interfaces for Focus and Atmosphere", "1,932 views"],
                ["Operational Dashboards That Stay Calm Under Load", "1,204 views"],
              ].map(([title, views], index) => (
                <div key={title} className={`
                  flex items-center gap-4 border-b border-white/8 py-3
                  last:border-b-0
                `}>
                  <div className="font-mono text-xl text-primary">{String(index + 1).padStart(2, "0")}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-fg">{title}</div>
                    <div className="text-xs text-muted">{views}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="cms-card p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-fg">Draft pipeline</h2>
              <p className="mt-1 text-sm text-muted">Current editorial workflow status.</p>
            </div>
            <div className="space-y-4">
              {[
                ["Research", "04"],
                ["Writing", "09"],
                ["Review", "03"],
                ["Ready", "03"],
              ].map(([label, value]) => (
                <div key={label} className={`
                  flex items-center justify-between rounded-xl border border-white/8 px-4 py-3
                `}>
                  <span className="text-sm text-muted">{label}</span>
                  <span className="font-mono text-lg text-fg">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CmsShell>
  );
}
