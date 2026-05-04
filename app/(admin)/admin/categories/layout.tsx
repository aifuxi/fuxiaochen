import type { ReactNode } from "react";

import type { Metadata } from "next";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.categories;

export default function AdminCategoriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
