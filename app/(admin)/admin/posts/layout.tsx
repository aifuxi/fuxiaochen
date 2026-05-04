import type { ReactNode } from "react";

import type { Metadata } from "next";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.posts;

export default function AdminPostsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
