import type { Metadata } from "next";

import { AdminDashboardPage } from "@/components/admin/admin-dashboard-page";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.dashboard;

export default function AdminDashboardRoutePage() {
  return <AdminDashboardPage />;
}
