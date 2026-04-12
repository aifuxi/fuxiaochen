import { CmsAnalyticsDashboard } from "@/components/blocks/cms-analytics-dashboard";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsAnalyticsPage() {
  return (
    <CmsShell description="追踪发布系统的流量、参与度和内容表现。" title="数据分析">
      <CmsAnalyticsDashboard />
    </CmsShell>
  );
}
