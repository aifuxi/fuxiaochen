import type { Metadata } from "next";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminUsersPage } from "@/components/admin/admin-users-page";

import {
  getSessionUserRole,
  getSessionUserId,
  requireServerSession,
} from "@/lib/auth-session";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.users;

export default async function AdminUsersRoutePage() {
  const session = await requireServerSession();

  if (getSessionUserRole(session) !== "admin") {
    return (
      <AdminAccessDenied description="你的账号已登录，但只有管理员可以管理用户。" />
    );
  }

  return <AdminUsersPage currentAdminId={getSessionUserId(session)} />;
}
