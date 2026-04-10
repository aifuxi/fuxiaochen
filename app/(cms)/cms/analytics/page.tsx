import { CmsAnalyticsDashboard } from "@/components/blocks/cms-analytics-dashboard";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsAnalyticsPage() {
  return (
    <CmsShell description="Traffic, engagement, and content performance across the publishing system." title="Analytics">
      <CmsAnalyticsDashboard />
    </CmsShell>
  );
}
