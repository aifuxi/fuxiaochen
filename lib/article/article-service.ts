import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { articleErrorCodes } from "@/lib/api/error-codes";
import type { CreateArticleInput, ListArticlesQuery, UpdateArticleInput } from "@/lib/article/article-dto";
import { toArticleDto, toArticleListItemDto } from "@/lib/article/article-dto";
import type { ArticleRepository } from "@/lib/article/article-repository";

type ListArticlesResult = {
  items: ReturnType<typeof toArticleListItemDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ArticleService = {
  createArticle: (input: CreateArticleInput) => Promise<ReturnType<typeof toArticleDto>>;
  deleteArticle: (id: string) => Promise<{ id: string }>;
  getArticleById: (id: string) => Promise<ReturnType<typeof toArticleDto>>;
  listArticles: (query: ListArticlesQuery) => Promise<ListArticlesResult>;
  updateArticle: (id: string, input: UpdateArticleInput) => Promise<ReturnType<typeof toArticleDto>>;
};

export function createArticleService(repository: ArticleRepository): ArticleService {
  return {
    async createArticle(input) {
      await ensureSlugAvailable(repository, input.slug);
      await ensureCategoryExists(repository, input.categoryId);
      await ensureTagsExist(repository, input.tagIds);

      const article = await createArticleWithConflictHandling(repository, input);

      return toArticleDto(article);
    },
    async deleteArticle(id) {
      await getExistingArticle(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getArticleById(id) {
      const article = await getExistingArticle(repository, id);

      return toArticleDto(article);
    },
    async listArticles(query) {
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
        items: items.map(toArticleListItemDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateArticle(id, input) {
      const existingArticle = await getExistingArticle(repository, id);

      if (input.slug && input.slug !== existingArticle.slug) {
        await ensureSlugAvailable(repository, input.slug, existingArticle.id);
      }

      if (input.categoryId !== undefined) {
        await ensureCategoryExists(repository, input.categoryId);
      }

      if (input.tagIds !== undefined) {
        await ensureTagsExist(repository, input.tagIds);
      }

      const article = await updateArticleWithConflictHandling(repository, id, input);

      return toArticleDto(article);
    },
  };
}

async function ensureCategoryExists(repository: ArticleRepository, categoryId?: string | null) {
  if (!categoryId) {
    return;
  }

  const category = await repository.findCategoryById(categoryId);

  if (!category) {
    throw new ApiError({
      code: articleErrorCodes.ARTICLE_CATEGORY_NOT_FOUND,
      message: "Category does not exist.",
    });
  }
}

async function ensureSlugAvailable(repository: ArticleRepository, slug: string, currentId?: string) {
  const existingArticle = await repository.findBySlug(slug);

  if (existingArticle && existingArticle.id !== currentId) {
    throw new ApiError({
      code: articleErrorCodes.ARTICLE_SLUG_CONFLICT,
      message: "Article slug already exists.",
    });
  }
}

async function ensureTagsExist(repository: ArticleRepository, tagIds?: string[]) {
  if (!tagIds || tagIds.length === 0) {
    return;
  }

  const tags = await repository.findTagsByIds(tagIds);
  const existingIds = new Set(tags.map((tag) => tag.id));
  const missingIds = tagIds.filter((tagId) => !existingIds.has(tagId));

  if (missingIds.length > 0) {
    throw new ApiError({
      code: articleErrorCodes.ARTICLE_TAG_NOT_FOUND,
      details: {
        ids: missingIds,
      },
      message: "One or more tags do not exist.",
    });
  }
}

async function getExistingArticle(repository: ArticleRepository, id: string) {
  const article = await repository.findById(id);

  if (!article) {
    throw new ApiError({
      code: articleErrorCodes.ARTICLE_NOT_FOUND,
      message: "Article does not exist.",
    });
  }

  return article;
}

async function createArticleWithConflictHandling(repository: ArticleRepository, input: CreateArticleInput) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeArticlePersistenceError(error);
  }
}

async function updateArticleWithConflictHandling(repository: ArticleRepository, id: string, input: UpdateArticleInput) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeArticlePersistenceError(error);
  }
}

function normalizeArticlePersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("slug")) {
      return new ApiError({
        code: articleErrorCodes.ARTICLE_SLUG_CONFLICT,
        message: "Article slug already exists.",
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
