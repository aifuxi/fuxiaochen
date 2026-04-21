import type { Project } from "@/lib/db/schema";

type ProjectReadModel = Project;

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  year: string;
};

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  published: boolean;
  year: number;
  createdAt: string;
  updatedAt: string;
};

export function toPublicProject(project: ProjectReadModel): PublicProject {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription,
    image: project.image,
    tags: project.tags,
    ...(project.githubUrl ? { githubUrl: project.githubUrl } : {}),
    ...(project.liveUrl ? { liveUrl: project.liveUrl } : {}),
    featured: project.featured,
    year: String(project.year),
  };
}

export function toAdminProject(project: ProjectReadModel): AdminProject {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription,
    image: project.image,
    tags: project.tags,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    featured: project.featured,
    published: project.published,
    year: project.year,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
