import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { changelogErrorCodes } from "@/lib/api/error-codes";
import type {
  CreateChangelogReleaseInput,
  ListChangelogReleasesQuery,
  UpdateChangelogReleaseInput,
} from "@/lib/changelog/changelog-dto";
import { toChangelogReleaseDto } from "@/lib/changelog/changelog-dto";
import type { ChangelogReleaseRepository } from "@/lib/changelog/changelog-repository";

type ListChangelogReleasesResult = {
  items: ReturnType<typeof toChangelogReleaseDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ChangelogReleaseService = {
  createRelease: (input: CreateChangelogReleaseInput) => Promise<ReturnType<typeof toChangelogReleaseDto>>;
  deleteRelease: (id: string) => Promise<{ id: string }>;
  getReleaseById: (id: string) => Promise<ReturnType<typeof toChangelogReleaseDto>>;
  listReleases: (query: ListChangelogReleasesQuery) => Promise<ListChangelogReleasesResult>;
  updateRelease: (id: string, input: UpdateChangelogReleaseInput) => Promise<ReturnType<typeof toChangelogReleaseDto>>;
};

export function createChangelogReleaseService(repository: ChangelogReleaseRepository): ChangelogReleaseService {
  return {
    async createRelease(input) {
      await ensureVersionAvailable(repository, input.version);

      const release = await createReleaseWithConflictHandling(repository, input);

      return toChangelogReleaseDto(release);
    },
    async deleteRelease(id) {
      await getExistingRelease(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getReleaseById(id) {
      const release = await getExistingRelease(repository, id);

      return toChangelogReleaseDto(release);
    },
    async listReleases(query) {
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
        items: items.map(toChangelogReleaseDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateRelease(id, input) {
      const existingRelease = await getExistingRelease(repository, id);

      if (input.version && input.version !== existingRelease.version) {
        await ensureVersionAvailable(repository, input.version, existingRelease.id);
      }

      const release = await updateReleaseWithConflictHandling(repository, id, input);

      return toChangelogReleaseDto(release);
    },
  };
}

async function ensureVersionAvailable(repository: ChangelogReleaseRepository, version: string, currentId?: string) {
  const existingRelease = await repository.findByVersion(version);

  if (existingRelease && existingRelease.id !== currentId) {
    throw new ApiError({
      code: changelogErrorCodes.CHANGELOG_VERSION_CONFLICT,
      message: "Changelog version already exists.",
    });
  }
}

async function getExistingRelease(repository: ChangelogReleaseRepository, id: string) {
  const release = await repository.findById(id);

  if (!release) {
    throw new ApiError({
      code: changelogErrorCodes.CHANGELOG_RELEASE_NOT_FOUND,
      message: "Changelog release does not exist.",
    });
  }

  return release;
}

async function createReleaseWithConflictHandling(repository: ChangelogReleaseRepository, input: CreateChangelogReleaseInput) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeChangelogPersistenceError(error);
  }
}

async function updateReleaseWithConflictHandling(repository: ChangelogReleaseRepository, id: string, input: UpdateChangelogReleaseInput) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeChangelogPersistenceError(error);
  }
}

function normalizeChangelogPersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("version")) {
      return new ApiError({
        code: changelogErrorCodes.CHANGELOG_VERSION_CONFLICT,
        message: "Changelog version already exists.",
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
