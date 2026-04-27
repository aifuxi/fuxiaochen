import { type Metadata } from "next";

import { getCachedPublicProjects } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { ProjectsPageClient } from "./projects-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.projects;
}

export default async function ProjectsPage() {
  const [{ settings }, projects] = await Promise.all([
    getCachedSiteSettings(),
    getCachedPublicProjects(),
  ]);

  return (
    <ProjectsPageClient settings={settings} initialProjects={projects.items} />
  );
}
