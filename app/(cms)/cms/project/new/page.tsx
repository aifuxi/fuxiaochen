import { CmsProjectForm } from "@/components/blocks/cms-project-form";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsNewProjectPage() {
  return (
    <CmsShell description="Create portfolio projects with links, technologies, and publishing metadata." title="Create Project">
      <CmsProjectForm />
    </CmsShell>
  );
}
