import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { tagErrorCodes } from "@/lib/api/error-codes";
import type { CreateTagInput, ListTagsQuery, UpdateTagInput } from "@/lib/tag/tag-dto";
import { toTagDto } from "@/lib/tag/tag-dto";
import type { TagRepository } from "@/lib/tag/tag-repository";

type ListTagsResult = {
  items: ReturnType<typeof toTagDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TagService = {
  createTag: (input: CreateTagInput) => Promise<ReturnType<typeof toTagDto>>;
  deleteTag: (id: string) => Promise<{ id: string }>;
  getTagById: (id: string) => Promise<ReturnType<typeof toTagDto>>;
  listTags: (query: ListTagsQuery) => Promise<ListTagsResult>;
  updateTag: (id: string, input: UpdateTagInput) => Promise<ReturnType<typeof toTagDto>>;
};

export function createTagService(repository: TagRepository): TagService {
  return {
    async createTag(input) {
      await ensureNameAvailable(repository, input.name);
      await ensureSlugAvailable(repository, input.slug);

      const tag = await createTagWithConflictHandling(repository, input);

      return toTagDto(tag);
    },
    async deleteTag(id) {
      await getExistingTag(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getTagById(id) {
      const tag = await getExistingTag(repository, id);

      return toTagDto(tag);
    },
    async listTags(query) {
      const skip = (query.page - 1) * query.pageSize;
      const [items, total] = await Promise.all([
        repository.findManyWithPagination({
          keyword: query.keyword,
          skip,
          take: query.pageSize,
        }),
        repository.countByKeyword(query.keyword),
      ]);

      return {
        items: items.map(toTagDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateTag(id, input) {
      const existingTag = await getExistingTag(repository, id);

      if (input.name && input.name !== existingTag.name) {
        await ensureNameAvailable(repository, input.name, existingTag.id);
      }

      if (input.slug && input.slug !== existingTag.slug) {
        await ensureSlugAvailable(repository, input.slug, existingTag.id);
      }

      const updatedTag = await updateTagWithConflictHandling(repository, id, input);

      return toTagDto(updatedTag);
    },
  };
}

async function ensureNameAvailable(repository: TagRepository, name: string, currentId?: string) {
  const existingTag = await repository.findByName(name);

  if (existingTag && existingTag.id !== currentId) {
    throw new ApiError({
      code: tagErrorCodes.TAG_NAME_CONFLICT,
      message: "Tag name already exists.",
    });
  }
}

async function ensureSlugAvailable(repository: TagRepository, slug: string, currentId?: string) {
  const existingTag = await repository.findBySlug(slug);

  if (existingTag && existingTag.id !== currentId) {
    throw new ApiError({
      code: tagErrorCodes.TAG_SLUG_CONFLICT,
      message: "Tag slug already exists.",
    });
  }
}

async function getExistingTag(repository: TagRepository, id: string) {
  const tag = await repository.findById(id);

  if (!tag) {
    throw new ApiError({
      code: tagErrorCodes.TAG_NOT_FOUND,
      message: "Tag does not exist.",
    });
  }

  return tag;
}

async function createTagWithConflictHandling(repository: TagRepository, input: CreateTagInput) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeTagPersistenceError(error);
  }
}

async function updateTagWithConflictHandling(repository: TagRepository, id: string, input: UpdateTagInput) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeTagPersistenceError(error);
  }
}

function normalizeTagPersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("slug")) {
      return new ApiError({
        code: tagErrorCodes.TAG_SLUG_CONFLICT,
        message: "Tag slug already exists.",
      });
    }

    if (targets.includes("name")) {
      return new ApiError({
        code: tagErrorCodes.TAG_NAME_CONFLICT,
        message: "Tag name already exists.",
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
