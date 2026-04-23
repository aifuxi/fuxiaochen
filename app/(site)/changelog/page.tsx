import { type Metadata } from "next";

import { siteCopy } from "@/constants/site-copy";

import { ChangelogPageClient } from "./changelog-page-client";

export const metadata: Metadata = {
  title: siteCopy.metadata.changelog.title,
  description: siteCopy.metadata.changelog.description,
};

export default function ChangelogPage() {
  return <ChangelogPageClient />;
}
