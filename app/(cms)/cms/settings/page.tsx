import { CmsSettingsManager } from "@/components/blocks/cms-settings-manager";
import { CmsShell } from "@/components/layout/cms-shell";
import { requireCmsAdminSession } from "@/lib/auth";

export default async function CmsSettingsPage() {
  await requireCmsAdminSession();

  return (
    <CmsShell description="Core workspace preferences, appearance, SEO, and moderation defaults." title="Settings">
      <CmsSettingsManager />
    </CmsShell>
  );
}
