import type { ReactNode } from "react";

import type { Metadata } from "next";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.changelog;

export default function AdminChangelogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
