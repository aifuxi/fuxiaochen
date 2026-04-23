import { type Metadata } from "next";

import { ChangelogPageClient } from "./changelog-page-client";

export const metadata: Metadata = {
  title: "Changelog | Fuxiaochen",
  description: "See what is new and improved in my blog and projects.",
};

export default function ChangelogPage() {
  return <ChangelogPageClient />;
}
