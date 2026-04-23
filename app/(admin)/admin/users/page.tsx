import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminUsersPage } from "@/components/admin/admin-users-page";

import {
  getSessionUserRole,
  getSessionUserId,
  requireServerSession,
} from "@/lib/auth-session";

export default async function AdminUsersRoutePage() {
  const session = await requireServerSession();

  if (getSessionUserRole(session) !== "admin") {
    return (
      <AdminAccessDenied description="Your account can use the admin area, but only administrators can manage users." />
    );
  }

  return <AdminUsersPage currentAdminId={getSessionUserId(session)} />;
}
