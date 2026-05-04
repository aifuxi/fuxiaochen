import type { Metadata } from "next";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminCommentsPage } from "@/components/admin/admin-comments-page";

import { getSessionUserRole, requireServerSession } from "@/lib/auth-session";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.comments;

export default async function AdminCommentsRoutePage() {
  const session = await requireServerSession();

  if (getSessionUserRole(session) !== "admin") {
    return (
      <AdminAccessDenied description="你的账号已登录，但只有管理员可以管理评论。" />
    );
  }

  return <AdminCommentsPage />;
}
