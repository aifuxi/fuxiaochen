import { ResourceTable } from "@/components/blocks/resource-table";
import { StatCard } from "@/components/blocks/stat-card";
import { CmsShell } from "@/components/layout/cms-shell";
import { Card } from "@/components/ui/card";
import { activityFeed, articleRows, cmsStats } from "@/lib/mocks/cms-content";

export default function CmsDashboardPage() {
  return (
    <CmsShell description="A snapshot of publishing throughput, moderation state, and editorial system health." title="Dashboard">
      <div className={`
        grid gap-4
        md:grid-cols-2
        xl:grid-cols-4
      `}>
        {cmsStats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      <div className={`
        mt-6 grid gap-6
        xl:grid-cols-[1.2fr_0.8fr]
      `}>
        <div className="glass-card rounded-2xl border border-white/8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Recent Articles</h2>
            <span className="font-mono-tech text-xs tracking-wider text-muted uppercase">Draft Queue</span>
          </div>
          <ResourceTable
            columns={[
              { key: "title", label: "Title" },
              { key: "category", label: "Category" },
              { key: "status", label: "Status" },
              { key: "updatedAt", label: "Updated" },
            ]}
            rows={articleRows}
          />
        </div>
        <Card className="space-y-4 rounded-2xl">
          <div className="type-label">Activity Feed</div>
          <ul className="space-y-3 text-sm leading-6 text-muted">
            {activityFeed.map((item, index) => (
              <li key={item} className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
                <span className="text-primary-accent mr-2">{`0${index + 1}`}</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </CmsShell>
  );
}
