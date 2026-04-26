import { generateCuid } from "@/lib/cuid";
import type { NewTag, Tag } from "@/lib/db/schema";
import { normalizeNullableString, slugify } from "@/lib/server/content-utils";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import type {
  AdminTagCreateInput,
  AdminTagListQuery,
  AdminTagUpdateInput,
} from "@/lib/server/tags/dto";

import { tagRepository } from "./repository";

export type TagReadModel = Tag & {
  blogCount: number;
  publishedBlogCount: number;
};

export interface TagRepository {
  listAdmin(query: AdminTagListQuery): Promise<{
    items: TagReadModel[];
    total: number;
  }>;
  listPublic(): Promise<TagReadModel[]>;
  findById(id: string): Promise<TagReadModel | null>;
  findBySlug(slug: string): Promise<TagReadModel | null>;
  create(tag: NewTag): Promise<TagReadModel>;
  update(id: string, tag: Partial<NewTag>): Promise<TagReadModel | null>;
  delete(id: string): Promise<boolean>;
}

export interface TagService {
  listAdminTags(query: AdminTagListQuery): Promise<{
    items: TagReadModel[];
    total: number;
  }>;
  listPublicTags(): Promise<TagReadModel[]>;
  getTag(id: string): Promise<TagReadModel>;
  createTag(input: AdminTagCreateInput): Promise<TagReadModel>;
  updateTag(id: string, input: AdminTagUpdateInput): Promise<TagReadModel>;
  deleteTag(id: string): Promise<void>;
}

export interface TagServiceDeps {
  repository?: TagRepository;
  now?: () => Date;
  generateId?: () => string;
}

const TAG_IN_USE_CONSTRAINT = "blog_tags_tag_id_fkey";

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.TAG_NOT_FOUND, "Tag not found", 404, {
    id,
  });

const createSlugConflictError = (slug: string) =>
  new AppError(ERROR_CODES.TAG_SLUG_CONFLICT, "Tag slug already exists", 409, {
    slug,
  });

const createInUseConflictError = (id: string) =>
  new AppError(ERROR_CODES.TAG_IN_USE, "Tag is in use", 409, {
    id,
  });

const isDuplicateSlugError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";

const isTagInUseError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  "constraint" in error &&
  (error as { code?: unknown }).code === "23503" &&
  (error as { constraint?: unknown }).constraint === TAG_IN_USE_CONSTRAINT;

const resolveSlug = (name: string, slug?: string) => {
  const resolvedSlug = slugify(slug ?? name);

  if (!resolvedSlug) {
    throw new AppError(
      ERROR_CODES.COMMON_VALIDATION_ERROR,
      "Tag slug cannot be empty",
      400,
    );
  }

  return resolvedSlug;
};

export function createTagService({
  repository = tagRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: TagServiceDeps = {}): TagService {
  return {
    listAdminTags(query) {
      return repository.listAdmin(query);
    },
    listPublicTags() {
      return repository.listPublic();
    },
    async getTag(id) {
      const tag = await repository.findById(id);

      if (!tag) {
        throw createNotFoundError(id);
      }

      return tag;
    },
    async createTag(input) {
      const slug = resolveSlug(input.name, input.slug);
      const existingTag = await repository.findBySlug(slug);

      if (existingTag) {
        throw createSlugConflictError(slug);
      }

      const timestamp = now();
      const tag: NewTag = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        name: input.name,
        slug,
        description: normalizeNullableString(input.description) ?? "",
      };

      try {
        return await repository.create(tag);
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(slug);
        }

        throw error;
      }
    },
    async updateTag(id, input) {
      const existingTag = await repository.findById(id);

      if (!existingTag) {
        throw createNotFoundError(id);
      }

      const resolvedSlug =
        input.name !== undefined || input.slug !== undefined
          ? resolveSlug(input.name ?? existingTag.name, input.slug)
          : undefined;

      if (resolvedSlug && resolvedSlug !== existingTag.slug) {
        const duplicateTag = await repository.findBySlug(resolvedSlug);

        if (duplicateTag && duplicateTag.id !== id) {
          throw createSlugConflictError(resolvedSlug);
        }
      }

      try {
        const updatedTag = await repository.update(id, {
          name: input.name,
          slug: resolvedSlug,
          description:
            input.description === undefined
              ? undefined
              : (normalizeNullableString(input.description) ?? ""),
          updatedAt: now(),
        });

        if (!updatedTag) {
          throw createNotFoundError(id);
        }

        return updatedTag;
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(resolvedSlug ?? existingTag.slug);
        }

        throw error;
      }
    },
    async deleteTag(id) {
      const existingTag = await repository.findById(id);

      if (!existingTag) {
        throw createNotFoundError(id);
      }

      let deleted: boolean;

      try {
        deleted = await repository.delete(id);
      } catch (error) {
        if (isTagInUseError(error)) {
          throw createInUseConflictError(id);
        }

        throw error;
      }

      if (!deleted) {
        throw createNotFoundError(id);
      }
    },
  };
}

export const tagService = createTagService();
