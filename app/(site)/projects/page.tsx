import { type Metadata } from "next";

import { ProjectsPageClient } from "./projects-page-client";

export const metadata: Metadata = {
  title: "Projects - Fuxiaochen",
  description: "Explore the projects and open source work by Fuxiaochen.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
