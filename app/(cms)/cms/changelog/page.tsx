import { CmsChangelogManager } from "@/components/blocks/cms-changelog-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsChangelogPage() {
  return (
    <CmsShell description="Manage release history, itemized updates, and version cadence against the live changelog API." title="Changelog">
      <CmsChangelogManager />
    </CmsShell>
  );
}
