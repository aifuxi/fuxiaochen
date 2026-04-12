import { CmsProjectForm } from "@/components/blocks/cms-project-form";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsNewProjectPage() {
  return (
    <CmsShell description="创建带有链接、技术和发布元数据的作品集项目。" title="创建项目">
      <CmsProjectForm />
    </CmsShell>
  );
}
