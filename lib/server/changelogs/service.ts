import { generateCuid } from "@/lib/cuid";
import type { Changelog, NewChangelog } from "@/lib/db/schema";
import type {
  AdminChangelogCreateInput,
  AdminChangelogUpdateInput,
  ChangelogListQuery,
} from "@/lib/server/changelogs/dto";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import { changelogRepository, type ChangelogRepository } from "./repository";

export interface ChangelogService {
  listChangelogs(query: ChangelogListQuery): Promise<{
    items: Changelog[];
    total: number;
  }>;
  getAdminChangelog(id: string): Promise<Changelog>;
  getPublicChangelogByVersion(version: string): Promise<Changelog>;
  createChangelog(input: AdminChangelogCreateInput): Promise<Changelog>;
  updateChangelog(
    id: string,
    input: AdminChangelogUpdateInput,
  ): Promise<Changelog>;
  deleteChangelog(id: string): Promise<void>;
}

export interface ChangelogServiceDeps {
  repository?: ChangelogRepository;
  now?: () => Date;
  generateId?: () => string;
}

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.CHANGELOG_NOT_FOUND, "Changelog not found", 404, {
    id,
  });

const createVersionConflictError = (version: string) =>
  new AppError(
    ERROR_CODES.CHANGELOG_VERSION_CONFLICT,
    "Changelog version already exists",
    409,
    { version },
  );

const isDuplicateVersionError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505" &&
  "constraint" in error &&
  (error as { constraint?: unknown }).constraint === "changelogs_version_key";

export function createChangelogService({
  repository = changelogRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: ChangelogServiceDeps = {}): ChangelogService {
  return {
    listChangelogs(query) {
      return repository.list(query);
    },
    async getAdminChangelog(id) {
      const changelog = await repository.findById(id);

      if (!changelog) {
        throw createNotFoundError(id);
      }

      return changelog;
    },
    async getPublicChangelogByVersion(version) {
      const changelog = await repository.findByVersion(version);

      if (!changelog) {
        throw createNotFoundError(version);
      }

      return changelog;
    },
    async createChangelog(input) {
      const existingChangelog = await repository.findByVersion(input.version);

      if (existingChangelog) {
        throw createVersionConflictError(input.version);
      }

      const timestamp = now();
      const changelog: NewChangelog = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        version: input.version,
        title: input.title,
        releaseDate: input.releaseDate,
        type: input.type,
        description: input.description,
        changes: input.changes,
      };

      try {
        return await repository.create(changelog);
      } catch (error) {
        if (isDuplicateVersionError(error)) {
          throw createVersionConflictError(input.version);
        }

        throw error;
      }
    },
    async updateChangelog(id, input) {
      const existingChangelog = await repository.findById(id);

      if (!existingChangelog) {
        throw createNotFoundError(id);
      }

      if (input.version && input.version !== existingChangelog.version) {
        const duplicateChangelog = await repository.findByVersion(
          input.version,
        );

        if (duplicateChangelog && duplicateChangelog.id !== id) {
          throw createVersionConflictError(input.version);
        }
      }

      try {
        const updatedChangelog = await repository.update(id, {
          version: input.version,
          title: input.title,
          releaseDate: input.releaseDate,
          type: input.type,
          description: input.description,
          changes: input.changes,
          updatedAt: now(),
        });

        if (!updatedChangelog) {
          throw createNotFoundError(id);
        }

        return updatedChangelog;
      } catch (error) {
        if (isDuplicateVersionError(error)) {
          throw createVersionConflictError(
            input.version ?? existingChangelog.version,
          );
        }

        throw error;
      }
    },
    async deleteChangelog(id) {
      const existingChangelog = await repository.findById(id);

      if (!existingChangelog) {
        throw createNotFoundError(id);
      }

      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createNotFoundError(id);
      }
    },
  };
}

export const changelogService = createChangelogService();
