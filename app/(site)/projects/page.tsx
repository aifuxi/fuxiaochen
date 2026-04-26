import { type Metadata } from "next";

import { settingsService } from "@/lib/server/settings/service";

import { ProjectsPageClient } from "./projects-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await settingsService.getSettings();

  return settings.seo.pages.projects;
}

export default async function ProjectsPage() {
  const { settings } = await settingsService.getSettings();

  return <ProjectsPageClient settings={settings} />;
}
