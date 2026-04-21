import { type Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { ProjectsPageClient } from "./projects-page-client";

export const metadata: Metadata = {
  title: "Projects - Fuxiaochen",
  description: "Explore the projects and open source work by Fuxiaochen.",
};

export default function ProjectsPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar />
      <ProjectsPageClient />
      <Footer />
    </div>
  );
}
