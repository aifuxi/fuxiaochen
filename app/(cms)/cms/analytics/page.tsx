import { CmsShell } from "@/components/layouts/cms-shell";
import { StatsGrid } from "@/components/cms/stats-grid";

const stats = [
  { label: "Visitors", value: "18.4k", detail: "rolling 30-day audience" },
  { label: "CTR", value: "4.8%", detail: "newsletter and content CTAs" },
  { label: "Avg read", value: "6m 12s", detail: "longform retention" },
  { label: "Bounce", value: "31%", detail: "home and archive sessions" },
] as const;

export default function CmsAnalyticsPage() {
  return (
    <CmsShell
      currentPath="/cms/analytics"
      description="Analytics route is live and ready for chart cards and reporting modules."
      title="Analytics"
    >
      <StatsGrid items={[...stats]} />
    </CmsShell>
  );
}
