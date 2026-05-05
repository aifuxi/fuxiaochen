import type { Metadata } from "next";

import { AdminAccessDenied } from "@/components/admin/admin-access-denied";
import { AdminApiLogsPage } from "@/components/admin/admin-api-logs-page";

import { getSessionUserRole, requireServerSession } from "@/lib/auth-session";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.logs;

export default async function AdminApiLogsRoutePage() {
  const session = await requireServerSession();

  if (getSessionUserRole(session) !== "admin") {
    return (
      <AdminAccessDenied description="你的账号已登录，但只有管理员可以查询接口日志。" />
    );
  }

  return <AdminApiLogsPage />;
}
