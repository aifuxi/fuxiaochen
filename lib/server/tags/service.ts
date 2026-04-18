import { generateCuid } from "@/lib/cuid";
import type { Tag } from "@/lib/db/schema";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import { tagRepository, type TagRepository } from "./repository";

export interface TagServiceDeps {
  repository?: TagRepository;
  now?: () => Date;
  generateId?: () => string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
  description: string;
}

export type UpdateTagInput = Partial<CreateTagInput>;

export interface TagService {
  listTags(query: { page: number; pageSize: number }): Promise<{
    items: Tag[];
    total: number;
  }>;
  getTag(id: string): Promise<Tag>;
  createTag(input: CreateTagInput): Promise<Tag>;
  updateTag(id: string, input: UpdateTagInput): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
}

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.TAG_NOT_FOUND, "Tag not found", 404, {
    id,
  });

const createSlugConflictError = (slug: string) =>
  new AppError(ERROR_CODES.TAG_SLUG_CONFLICT, "Tag slug already exists", 409, {
    slug,
  });

const isDuplicateSlugError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";

export function createTagService({
  repository = tagRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: TagServiceDeps = {}): TagService {
  return {
    listTags(query) {
      return repository.list(query);
    },
    async getTag(id) {
      const tag = await repository.findById(id);

      if (!tag) {
        throw createNotFoundError(id);
      }

      return tag;
    },
    async createTag(input) {
      const existingTag = await repository.findBySlug(input.slug);

      if (existingTag) {
        throw createSlugConflictError(input.slug);
      }

      const timestamp = now();
      const tag = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input,
      };

      try {
        return await repository.create(tag);
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(input.slug);
        }

        throw error;
      }
    },
    async updateTag(id, input) {
      const existingTag = await repository.findById(id);

      if (!existingTag) {
        throw createNotFoundError(id);
      }

      if (input.slug && input.slug !== existingTag.slug) {
        const duplicateTag = await repository.findBySlug(input.slug);

        if (duplicateTag && duplicateTag.id !== id) {
          throw createSlugConflictError(input.slug);
        }
      }

      try {
        const updatedTag = await repository.update(id, {
          ...input,
          updatedAt: now(),
        });

        if (!updatedTag) {
          throw createNotFoundError(id);
        }

        return updatedTag;
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(input.slug ?? existingTag.slug);
        }

        throw error;
      }
    },
    async deleteTag(id) {
      const existingTag = await repository.findById(id);

      if (!existingTag) {
        throw createNotFoundError(id);
      }

      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createNotFoundError(id);
      }
    },
  };
}

export const tagService = createTagService();
