import { CmsUserManager } from "@/components/blocks/cms-user-manager";
import { CmsShell } from "@/components/layout/cms-shell";
import { requireCmsAdminSession } from "@/lib/auth";

export default async function CmsUsersPage() {
  await requireCmsAdminSession();

  return (
    <CmsShell description="管理 CMS 用户账户、验证状态、关联凭证和活跃会话。" title="用户">
      <CmsUserManager />
    </CmsShell>
  );
}
