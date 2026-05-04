import type { ReactNode } from "react";

import type { Metadata } from "next";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.projects;

export default function AdminProjectsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
