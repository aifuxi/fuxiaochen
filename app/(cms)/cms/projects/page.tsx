import { CmsProjectManager } from "@/components/blocks/cms-project-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsProjectsPage() {
  return (
    <CmsShell description="管理作品集、精选项目和项目元数据。" title="项目">
      <CmsProjectManager />
    </CmsShell>
  );
}
