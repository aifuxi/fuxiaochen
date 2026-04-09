import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { projectErrorCodes } from "@/lib/api/error-codes";
import type { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from "@/lib/project/project-dto";
import { toProjectDto } from "@/lib/project/project-dto";
import type { ProjectRepository } from "@/lib/project/project-repository";

type ListProjectsResult = {
  items: ReturnType<typeof toProjectDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProjectService = {
  createProject: (input: CreateProjectInput) => Promise<ReturnType<typeof toProjectDto>>;
  deleteProject: (id: string) => Promise<{ id: string }>;
  getProjectById: (id: string) => Promise<ReturnType<typeof toProjectDto>>;
  listProjects: (query: ListProjectsQuery) => Promise<ListProjectsResult>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<ReturnType<typeof toProjectDto>>;
};

export function createProjectService(repository: ProjectRepository): ProjectService {
  return {
    async createProject(input) {
      await ensureSlugAvailable(repository, input.slug);
      await ensureCoverAssetExists(repository, input.coverAssetId);

      const project = await createProjectWithConflictHandling(repository, input);

      return toProjectDto(project);
    },
    async deleteProject(id) {
      await getExistingProject(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getProjectById(id) {
      const project = await getExistingProject(repository, id);

      return toProjectDto(project);
    },
    async listProjects(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findManyWithPagination({
          ...query,
          skip,
          take: query.pageSize,
        }),
        repository.countByFilters(query),
      ]);

      return {
        items: items.map(toProjectDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateProject(id, input) {
      const existingProject = await getExistingProject(repository, id);

      if (input.slug && input.slug !== existingProject.slug) {
        await ensureSlugAvailable(repository, input.slug, existingProject.id);
      }

      if (input.coverAssetId !== undefined) {
        await ensureCoverAssetExists(repository, input.coverAssetId);
      }

      const project = await updateProjectWithConflictHandling(repository, id, input);

      return toProjectDto(project);
    },
  };
}

async function ensureCoverAssetExists(repository: ProjectRepository, coverAssetId?: string | null) {
  if (!coverAssetId) {
    return;
  }

  const coverAsset = await repository.findCoverAssetById(coverAssetId);

  if (!coverAsset) {
    throw new ApiError({
      code: projectErrorCodes.PROJECT_COVER_ASSET_NOT_FOUND,
      message: "Cover asset does not exist.",
    });
  }
}

async function ensureSlugAvailable(repository: ProjectRepository, slug: string, currentId?: string) {
  const existingProject = await repository.findBySlug(slug);

  if (existingProject && existingProject.id !== currentId) {
    throw new ApiError({
      code: projectErrorCodes.PROJECT_SLUG_CONFLICT,
      message: "Project slug already exists.",
    });
  }
}

async function getExistingProject(repository: ProjectRepository, id: string) {
  const project = await repository.findById(id);

  if (!project) {
    throw new ApiError({
      code: projectErrorCodes.PROJECT_NOT_FOUND,
      message: "Project does not exist.",
    });
  }

  return project;
}

async function createProjectWithConflictHandling(repository: ProjectRepository, input: CreateProjectInput) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeProjectPersistenceError(error);
  }
}

async function updateProjectWithConflictHandling(repository: ProjectRepository, id: string, input: UpdateProjectInput) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeProjectPersistenceError(error);
  }
}

function normalizeProjectPersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("slug")) {
      return new ApiError({
        code: projectErrorCodes.PROJECT_SLUG_CONFLICT,
        message: "Project slug already exists.",
      });
    }
  }

  return error;
}

function getErrorTargets(error: Prisma.PrismaClientKnownRequestError) {
  const target = error.meta?.target;

  return Array.isArray(target) ? target.filter((item): item is string => typeof item === "string") : [];
}

function isPrismaUniqueConflictError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
