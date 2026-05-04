import type { ReactNode } from "react";

import type { Metadata } from "next";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.settings;

export default function AdminSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
