import { CmsProjectForm } from "@/components/blocks/cms-project-form";
import { CmsShell } from "@/components/layout/cms-shell";

type CmsEditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CmsEditProjectPage({ params }: CmsEditProjectPageProps) {
  const { id } = await params;

  return (
    <CmsShell description="更新项目元数据、链接、精选状态和技术栈。" title="编辑项目">
      <CmsProjectForm projectId={id} />
    </CmsShell>
  );
}
