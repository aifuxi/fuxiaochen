import { StatCard } from "@/components/blocks/stat-card";
import { CmsShell } from "@/components/layout/cms-shell";
import { Card } from "@/components/ui/card";
import { cmsStats } from "@/lib/mocks/cms-content";

export default function CmsAnalyticsPage() {
  return (
    <CmsShell description="A placeholder analytics surface for chart and reporting patterns." title="Analytics">
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
        xl:grid-cols-2
      `}>
        <Card className="space-y-4">
          <div className="type-label">Traffic Story</div>
          <div className="h-64 rounded-[1.6rem] bg-gradient-to-br from-primary/16 via-white/4 to-transparent" />
        </Card>
        <Card className="space-y-4">
          <div className="type-label">Engagement Story</div>
          <div className="h-64 rounded-[1.6rem] bg-gradient-to-br from-sky-500/16 via-white/4 to-transparent" />
        </Card>
      </div>
    </CmsShell>
  );
}
