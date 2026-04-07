import { CmsShell } from "@/components/layout/cms-shell";
import { cmsStats } from "@/lib/mocks/cms-content";

const popularItems = [
  "Building a Scalable Design System with CSS Custom Properties",
  "Editorial Motion for Content-Heavy Websites",
  "Model the Content Layer Before the Database",
  "The Art of Typography in Digital Design",
];

export default function CmsAnalyticsPage() {
  return (
    <CmsShell description="Traffic, engagement, and content performance across the publishing system." title="Analytics">
      <div className={`
        mb-8 grid gap-4
        md:grid-cols-2
        xl:grid-cols-5
      `}>
        {cmsStats.map((stat) => (
          <div key={stat.title} className="glass-card rounded-2xl border border-white/8 p-5 text-center">
            <div className="mb-1 font-mono text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="mb-2 text-xs text-muted">{stat.title}</div>
            <span className={`
              inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs
              ${stat.tone === "success" ? `bg-primary/10 text-primary` : stat.tone === "warning" ? `
                bg-red-500/10 text-red-400
              ` : `bg-sky-500/10 text-sky-400`}
            `}>
              {stat.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-white/8 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><span className="text-primary">◌</span> Traffic Overview</h2>
          <div className="flex gap-2">
            {["7D", "30D", "90D"].map((period, index) => (
              <button key={period} className={index === 1 ? "rounded-lg bg-primary px-3 py-1 text-xs text-black" : `
                rounded-lg bg-white/6 px-3 py-1 text-xs text-muted
              `}>
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="bar-chart flex h-[200px] items-end gap-4 border-b border-white/8 py-6">
          {[42, 64, 58, 71, 88, 75, 93].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full max-w-12 rounded-t-lg bg-[linear-gradient(to_top,#10b981,rgba(16,185,129,0.6))]" style={{ height: `${height * 1.6}px` }} />
              <div className="text-xs text-muted">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`
        mt-6 grid gap-6
        xl:grid-cols-2
      `}>
        <div className="glass-card rounded-2xl border border-white/8 p-6">
          <h2 className="mb-4 text-lg font-semibold">Growth Trend</h2>
          <div className="h-64 rounded-2xl bg-[linear-gradient(180deg,rgba(16,185,129,0.18),rgba(16,185,129,0.02))]" />
        </div>
        <div className="glass-card rounded-2xl border border-white/8 p-6">
          <h2 className="mb-4 text-lg font-semibold">Popular Articles</h2>
          <ul className="space-y-2">
            {popularItems.map((item, index) => (
              <li key={item} className={`
                flex items-center gap-4 border-b border-white/8 py-4
                last:border-b-0
              `}>
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                  ${index === 0 ? `bg-primary/10 text-primary` : index === 1 ? `bg-indigo-500/10 text-indigo-400` : index === 2 ? `
                    bg-amber-500/10 text-amber-400
                  ` : `bg-white/6 text-muted`}
                `}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{item}</div>
                  <div className="mt-1 text-xs text-muted">{(index + 2) * 4.2}k views</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CmsShell>
  );
}
