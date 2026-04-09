import { CmsChangelogForm } from "@/components/blocks/cms-changelog-form";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsNewChangelogPage() {
  return (
    <CmsShell description="Create a changelog release with nested update items and version metadata." title="Create Release">
      <CmsChangelogForm />
    </CmsShell>
  );
}
