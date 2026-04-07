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
        <div className="space-y-4">
          <div className="type-label">Latest Articles</div>
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
        <Card className="space-y-4">
          <div className="type-label">Activity Feed</div>
          <ul className="space-y-3 text-sm leading-6 text-muted">
            {activityFeed.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </CmsShell>
  );
}
