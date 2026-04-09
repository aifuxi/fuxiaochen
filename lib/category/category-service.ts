import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import { categoryErrorCodes } from "@/lib/api/error-codes";
import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from "@/lib/category/category-dto";
import { toCategoryDto } from "@/lib/category/category-dto";
import type { CategoryRepository } from "@/lib/category/category-repository";

type ListCategoriesResult = {
  items: ReturnType<typeof toCategoryDto>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CategoryService = {
  createCategory: (input: CreateCategoryInput) => Promise<ReturnType<typeof toCategoryDto>>;
  deleteCategory: (id: string) => Promise<{ id: string }>;
  getCategoryById: (id: string) => Promise<ReturnType<typeof toCategoryDto>>;
  listCategories: (query: ListCategoriesQuery) => Promise<ListCategoriesResult>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<ReturnType<typeof toCategoryDto>>;
};

export function createCategoryService(repository: CategoryRepository): CategoryService {
  return {
    async createCategory(input) {
      await ensureNameAvailable(repository, input.name);
      await ensureSlugAvailable(repository, input.slug);

      const category = await createCategoryWithConflictHandling(repository, input);

      return toCategoryDto(category);
    },
    async deleteCategory(id) {
      await getExistingCategory(repository, id);
      await repository.delete(id);

      return { id };
    },
    async getCategoryById(id) {
      const category = await getExistingCategory(repository, id);

      return toCategoryDto(category);
    },
    async listCategories(query) {
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
        items: items.map(toCategoryDto),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      };
    },
    async updateCategory(id, input) {
      const existingCategory = await getExistingCategory(repository, id);

      if (input.name && input.name !== existingCategory.name) {
        await ensureNameAvailable(repository, input.name, existingCategory.id);
      }

      if (input.slug && input.slug !== existingCategory.slug) {
        await ensureSlugAvailable(repository, input.slug, existingCategory.id);
      }

      const updatedCategory = await updateCategoryWithConflictHandling(repository, id, input);

      return toCategoryDto(updatedCategory);
    },
  };
}

async function ensureNameAvailable(repository: CategoryRepository, name: string, currentId?: string) {
  const existingCategory = await repository.findByName(name);

  if (existingCategory && existingCategory.id !== currentId) {
    throw new ApiError({
      code: categoryErrorCodes.CATEGORY_NAME_CONFLICT,
      message: "Category name already exists.",
    });
  }
}

async function ensureSlugAvailable(repository: CategoryRepository, slug: string, currentId?: string) {
  const existingCategory = await repository.findBySlug(slug);

  if (existingCategory && existingCategory.id !== currentId) {
    throw new ApiError({
      code: categoryErrorCodes.CATEGORY_SLUG_CONFLICT,
      message: "Category slug already exists.",
    });
  }
}

async function getExistingCategory(repository: CategoryRepository, id: string) {
  const category = await repository.findById(id);

  if (!category) {
    throw new ApiError({
      code: categoryErrorCodes.CATEGORY_NOT_FOUND,
      message: "Category does not exist.",
    });
  }

  return category;
}

async function createCategoryWithConflictHandling(repository: CategoryRepository, input: CreateCategoryInput) {
  try {
    return await repository.create(input);
  } catch (error) {
    throw normalizeCategoryPersistenceError(error);
  }
}

async function updateCategoryWithConflictHandling(repository: CategoryRepository, id: string, input: UpdateCategoryInput) {
  try {
    return await repository.update(id, input);
  } catch (error) {
    throw normalizeCategoryPersistenceError(error);
  }
}

function normalizeCategoryPersistenceError(error: unknown) {
  if (isPrismaUniqueConflictError(error)) {
    const targets = getErrorTargets(error);

    if (targets.includes("slug")) {
      return new ApiError({
        code: categoryErrorCodes.CATEGORY_SLUG_CONFLICT,
        message: "Category slug already exists.",
      });
    }

    if (targets.includes("name")) {
      return new ApiError({
        code: categoryErrorCodes.CATEGORY_NAME_CONFLICT,
        message: "Category name already exists.",
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
