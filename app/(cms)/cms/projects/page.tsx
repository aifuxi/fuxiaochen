import { CmsProjectManager } from "@/components/blocks/cms-project-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsProjectsPage() {
  return (
    <CmsShell description="Manage the portfolio library, featured work, and project metadata against the live API." title="Projects">
      <CmsProjectManager />
    </CmsShell>
  );
}
