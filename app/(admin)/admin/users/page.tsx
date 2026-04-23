import { AdminUsersPage } from "@/components/admin/admin-users-page";

import {
  getSessionUserId,
  requireServerAdminSession,
} from "@/lib/auth-session";

export default async function AdminUsersRoutePage() {
  const session = await requireServerAdminSession();

  return <AdminUsersPage currentAdminId={getSessionUserId(session)} />;
}
