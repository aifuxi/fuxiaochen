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
    <CmsShell description="Update project metadata, links, featured state, and technologies." title="Edit Project">
      <CmsProjectForm projectId={id} />
    </CmsShell>
  );
}
