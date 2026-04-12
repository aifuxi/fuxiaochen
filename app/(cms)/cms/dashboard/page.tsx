import { CmsDashboardOverview } from "@/components/blocks/cms-dashboard-overview";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsDashboardPage() {
  return (
    <CmsShell description="发布吞吐量、审核状态和编辑系统健康状况的快照。" title="仪表盘">
      <CmsDashboardOverview />
    </CmsShell>
  );
}
