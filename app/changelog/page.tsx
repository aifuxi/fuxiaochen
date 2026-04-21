import { type Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { ChangelogPageClient } from "./changelog-page-client";

export const metadata: Metadata = {
  title: "Changelog | Fuxiaochen",
  description: "See what is new and improved in my blog and projects.",
};

export default function ChangelogPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <ChangelogPageClient />
      <Footer />
    </div>
  );
}
