import { generateCuid } from "@/lib/cuid";
import type { NewProject, Project } from "@/lib/db/schema";
import { normalizeNullableString, slugify } from "@/lib/server/content-utils";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import type {
  AdminProjectCreateInput,
  AdminProjectListQuery,
  AdminProjectUpdateInput,
  PublicProjectListQuery,
} from "@/lib/server/projects/dto";

import { projectRepository, type ProjectRepository } from "./repository";

export interface ProjectService {
  listAdminProjects(query: AdminProjectListQuery): Promise<{
    items: Project[];
    total: number;
  }>;
  listPublicProjects(query: PublicProjectListQuery): Promise<{
    items: Project[];
    total: number;
  }>;
  getAdminProject(id: string): Promise<Project>;
  getPublicProjectBySlug(slug: string): Promise<Project>;
  createProject(input: AdminProjectCreateInput): Promise<Project>;
  updateProject(id: string, input: AdminProjectUpdateInput): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

export interface ProjectServiceDeps {
  repository?: ProjectRepository;
  now?: () => Date;
  generateId?: () => string;
}

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found", 404, {
    id,
  });

const createSlugConflictError = (slug: string) =>
  new AppError(
    ERROR_CODES.PROJECT_SLUG_CONFLICT,
    "Project slug already exists",
    409,
    { slug },
  );

const isDuplicateSlugError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";

const resolveSlug = (title: string, slug?: string) => {
  const resolvedSlug = slugify(slug ?? title);

  if (!resolvedSlug) {
    throw new AppError(
      ERROR_CODES.COMMON_VALIDATION_ERROR,
      "Project slug cannot be empty",
      400,
    );
  }

  return resolvedSlug;
};

const normalizeTags = (tags: string[]) => [
  ...new Set(tags.map((tag) => tag.trim())),
];

export function createProjectService({
  repository = projectRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: ProjectServiceDeps = {}): ProjectService {
  return {
    listAdminProjects(query) {
      return repository.listAdmin(query);
    },
    listPublicProjects(query) {
      return repository.listPublic(query);
    },
    async getAdminProject(id) {
      const project = await repository.findById(id);

      if (!project) {
        throw createNotFoundError(id);
      }

      return project;
    },
    async getPublicProjectBySlug(slug) {
      const project = await repository.findBySlug(slug);

      if (!project || !project.published) {
        throw createNotFoundError(slug);
      }

      return project;
    },
    async createProject(input) {
      const slug = resolveSlug(input.title, input.slug);
      const existingProject = await repository.findBySlug(slug);

      if (existingProject) {
        throw createSlugConflictError(slug);
      }

      const timestamp = now();
      const project: NewProject = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        title: input.title,
        slug,
        description: input.description,
        longDescription: input.longDescription,
        image: input.image ?? "",
        tags: normalizeTags(input.tags),
        githubUrl: normalizeNullableString(input.githubUrl),
        liveUrl: normalizeNullableString(input.liveUrl),
        featured: input.featured,
        published: input.published,
        year: input.year,
      };

      try {
        return await repository.create(project);
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(slug);
        }

        throw error;
      }
    },
    async updateProject(id, input) {
      const existingProject = await repository.findById(id);

      if (!existingProject) {
        throw createNotFoundError(id);
      }

      const resolvedSlug =
        input.title !== undefined || input.slug !== undefined
          ? resolveSlug(input.title ?? existingProject.title, input.slug)
          : undefined;

      if (resolvedSlug && resolvedSlug !== existingProject.slug) {
        const duplicateProject = await repository.findBySlug(resolvedSlug);

        if (duplicateProject && duplicateProject.id !== id) {
          throw createSlugConflictError(resolvedSlug);
        }
      }

      try {
        const updatedProject = await repository.update(id, {
          title: input.title,
          slug: resolvedSlug,
          description: input.description,
          longDescription: input.longDescription,
          image: input.image,
          tags: input.tags ? normalizeTags(input.tags) : undefined,
          githubUrl:
            input.githubUrl === undefined
              ? undefined
              : normalizeNullableString(input.githubUrl),
          liveUrl:
            input.liveUrl === undefined
              ? undefined
              : normalizeNullableString(input.liveUrl),
          featured: input.featured,
          published: input.published,
          year: input.year,
          updatedAt: now(),
        });

        if (!updatedProject) {
          throw createNotFoundError(id);
        }

        return updatedProject;
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(resolvedSlug ?? existingProject.slug);
        }

        throw error;
      }
    },
    async deleteProject(id) {
      const existingProject = await repository.findById(id);

      if (!existingProject) {
        throw createNotFoundError(id);
      }

      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createNotFoundError(id);
      }
    },
  };
}

export const projectService = createProjectService();
