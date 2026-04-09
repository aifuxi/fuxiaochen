import { CmsTagManager } from "@/components/blocks/cms-tag-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsTagsPage() {
  return (
    <CmsShell description="Manage reusable labels, article associations, and editorial taxonomy in one place." title="Tags">
      <CmsTagManager />
    </CmsShell>
  );
}
