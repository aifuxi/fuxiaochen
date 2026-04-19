"use client";

import { usePathname } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return <AdminShell pathname={pathname}>{children}</AdminShell>;
}
