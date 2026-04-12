import { CmsSettingsManager } from "@/components/blocks/cms-settings-manager";
import { CmsShell } from "@/components/layout/cms-shell";
import { requireCmsAdminSession } from "@/lib/auth";

export default async function CmsSettingsPage() {
  await requireCmsAdminSession();

  return (
    <CmsShell description="核心工作区偏好、外观、SEO 和审核默认设置。" title="设置">
      <CmsSettingsManager />
    </CmsShell>
  );
}
