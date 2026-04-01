import { CmsShell } from "@/components/layouts/cms-shell";
import { analyticsStats, popularArticles, trafficBars } from "@/lib/mock/design-content";

export default function CmsAnalyticsPage() {
  return (
    <CmsShell
      currentPath="/cms/analytics"
      description="Analytics route is live and ready for chart cards and reporting modules."
      title="Analytics"
    >
      <div className="space-y-6">
        <div className={`
          grid gap-4
          md:grid-cols-2
          xl:grid-cols-5
        `}>
          {analyticsStats.map((item) => (
            <div key={item.label} className="cms-card p-5 text-center">
              <div className="font-mono text-3xl font-bold text-fg">{item.value}</div>
              <div className="mt-1 text-xs text-muted">{item.label}</div>
              <div className="mt-3 inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs text-primary">
                {item.detail}
              </div>
            </div>
          ))}
        </div>

        <div className={`
          grid gap-6
          xl:grid-cols-[1.15fr_0.85fr]
        `}>
          <section className="cms-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">Traffic overview</h2>
              <div className="flex gap-2">
                {["7d", "30d", "90d"].map((period, index) => (
                  <button
                    key={period}
                    type="button"
                    className={`
                      rounded-md px-3 py-1.5 text-xs
                      ${
                      index === 1
                        ? "bg-primary text-primary-fg"
                        : "bg-white/8 text-muted"
                    }
                    `}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex h-[220px] items-end gap-4 border-b border-border pb-6">
              {trafficBars.map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="font-mono text-xs text-fg">{bar.value}k</div>
                  <div
                    className={`
                      w-full max-w-12 rounded-t-md
                      bg-[linear-gradient(to_top,var(--color-primary),rgb(16_185_129_/_0.6))] transition-transform
                      hover:scale-y-[1.02]
                    `}
                    style={{ height: `${bar.value * 1.7}px` }}
                  />
                  <div className="text-xs text-muted">{bar.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="cms-card p-6">
            <h2 className="mb-5 text-lg font-semibold text-fg">Popular articles</h2>
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <div key={article.title} className={`
                  flex items-center gap-4 border-b border-border/80 pb-4
                  last:border-b-0
                `}>
                  <div className="font-mono text-xl text-primary">{String(index + 1).padStart(2, "0")}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-fg">{article.title}</div>
                    <div className="text-xs text-muted">{article.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CmsShell>
  );
}
