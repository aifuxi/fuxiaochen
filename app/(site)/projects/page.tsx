import { type Metadata } from "next";

import { siteCopy } from "@/constants/site-copy";

import { ProjectsPageClient } from "./projects-page-client";

export const metadata: Metadata = {
  title: siteCopy.metadata.projects.title,
  description: siteCopy.metadata.projects.description,
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
