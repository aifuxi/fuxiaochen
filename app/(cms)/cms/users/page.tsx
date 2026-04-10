import { CmsUserManager } from "@/components/blocks/cms-user-manager";
import { CmsShell } from "@/components/layout/cms-shell";
import { requireCmsAdminSession } from "@/lib/auth";

export default async function CmsUsersPage() {
  await requireCmsAdminSession();

  return (
    <CmsShell description="Manage CMS user accounts, verification state, linked credentials, and active sessions." title="Users">
      <CmsUserManager />
    </CmsShell>
  );
}
