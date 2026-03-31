import { CmsShell } from "@/components/layouts/cms-shell";
import { SiteSettingsForm } from "@/components/features/cms/settings/site-settings-form";

export default function CmsArticleNewPage() {
  return (
    <CmsShell
      currentPath="/cms/articles"
      description="This route reserves the editor slot. Replace the temporary form with article editor sections next."
      title="New Article"
    >
      <SiteSettingsForm />
    </CmsShell>
  );
}
