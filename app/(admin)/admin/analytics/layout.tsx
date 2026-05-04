import type { ReactNode } from "react";

import type { Metadata } from "next";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.analytics;

export default function AdminAnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
