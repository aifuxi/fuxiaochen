import { generateCuid } from "@/lib/cuid";
import type { Category } from "@/lib/db/schema";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";
import type { CategoryListQuery } from "@/lib/server/categories/dto";

import { categoryRepository, type CategoryRepository } from "./repository";

export interface CategoryServiceDeps {
  repository?: CategoryRepository;
  now?: () => Date;
  generateId?: () => string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CategoryService {
  listCategories(query: CategoryListQuery): Promise<{
    items: Category[];
    total: number;
  }>;
  getCategory(id: string): Promise<Category>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

const CATEGORY_IN_USE_CONSTRAINT = "blogs_category_id_fkey";

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.CATEGORY_NOT_FOUND, "Category not found", 404, {
    id,
  });

const createSlugConflictError = (slug: string) =>
  new AppError(
    ERROR_CODES.CATEGORY_SLUG_CONFLICT,
    "Category slug already exists",
    409,
    { slug },
  );

const createInUseConflictError = (id: string) =>
  new AppError(ERROR_CODES.COMMON_INVALID_REQUEST, "Category is in use", 409, {
    id,
  });

const isDuplicateSlugError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "23505";

const isCategoryInUseError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  "constraint" in error &&
  (error as { code?: unknown }).code === "23503" &&
  (error as { constraint?: unknown }).constraint === CATEGORY_IN_USE_CONSTRAINT;

export function createCategoryService({
  repository = categoryRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: CategoryServiceDeps = {}): CategoryService {
  return {
    listCategories(query) {
      return repository.list(query);
    },
    async getCategory(id) {
      const category = await repository.findById(id);

      if (!category) {
        throw createNotFoundError(id);
      }

      return category;
    },
    async createCategory(input) {
      const existingCategory = await repository.findBySlug(input.slug);

      if (existingCategory) {
        throw createSlugConflictError(input.slug);
      }

      const timestamp = now();
      const category = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input,
      };

      try {
        return await repository.create(category);
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(input.slug);
        }

        throw error;
      }
    },
    async updateCategory(id, input) {
      const existingCategory = await repository.findById(id);

      if (!existingCategory) {
        throw createNotFoundError(id);
      }

      if (input.slug && input.slug !== existingCategory.slug) {
        const duplicateCategory = await repository.findBySlug(input.slug);

        if (duplicateCategory && duplicateCategory.id !== id) {
          throw createSlugConflictError(input.slug);
        }
      }

      try {
        const updatedCategory = await repository.update(id, {
          ...input,
          updatedAt: now(),
        });

        if (!updatedCategory) {
          throw createNotFoundError(id);
        }

        return updatedCategory;
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(input.slug ?? existingCategory.slug);
        }

        throw error;
      }
    },
    async deleteCategory(id) {
      const existingCategory = await repository.findById(id);

      if (!existingCategory) {
        throw createNotFoundError(id);
      }

      let deleted: boolean;

      try {
        deleted = await repository.delete(id);
      } catch (error) {
        if (isCategoryInUseError(error)) {
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

export const categoryService = createCategoryService();
