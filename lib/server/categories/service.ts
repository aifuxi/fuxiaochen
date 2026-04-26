import { generateCuid } from "@/lib/cuid";
import type { Category, NewCategory } from "@/lib/db/schema";
import type {
  AdminCategoryCreateInput,
  AdminCategoryListQuery,
  AdminCategoryUpdateInput,
} from "@/lib/server/categories/dto";
import { slugify } from "@/lib/server/content-utils";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import { categoryRepository } from "./repository";

export type CategoryReadModel = Category & {
  blogCount: number;
  publishedBlogCount: number;
};

export interface CategoryRepository {
  listAdmin(query: AdminCategoryListQuery): Promise<{
    items: CategoryReadModel[];
    total: number;
  }>;
  listPublic(): Promise<CategoryReadModel[]>;
  findById(id: string): Promise<CategoryReadModel | null>;
  findBySlug(slug: string): Promise<CategoryReadModel | null>;
  create(category: NewCategory): Promise<CategoryReadModel>;
  update(
    id: string,
    category: Partial<NewCategory>,
  ): Promise<CategoryReadModel | null>;
  delete(id: string): Promise<boolean>;
}

export interface CategoryService {
  listAdminCategories(query: AdminCategoryListQuery): Promise<{
    items: CategoryReadModel[];
    total: number;
  }>;
  listPublicCategories(): Promise<CategoryReadModel[]>;
  getCategory(id: string): Promise<CategoryReadModel>;
  createCategory(input: AdminCategoryCreateInput): Promise<CategoryReadModel>;
  updateCategory(
    id: string,
    input: AdminCategoryUpdateInput,
  ): Promise<CategoryReadModel>;
  deleteCategory(id: string): Promise<void>;
}

export interface CategoryServiceDeps {
  repository?: CategoryRepository;
  now?: () => Date;
  generateId?: () => string;
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
  new AppError(ERROR_CODES.CATEGORY_IN_USE, "Category is in use", 409, {
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

const resolveSlug = (slug: string) => {
  const resolvedSlug = slugify(slug);

  if (!resolvedSlug) {
    throw new AppError(
      ERROR_CODES.COMMON_VALIDATION_ERROR,
      "Category slug cannot be empty",
      400,
    );
  }

  return resolvedSlug;
};

export function createCategoryService({
  repository = categoryRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: CategoryServiceDeps = {}): CategoryService {
  return {
    listAdminCategories(query) {
      return repository.listAdmin(query);
    },
    listPublicCategories() {
      return repository.listPublic();
    },
    async getCategory(id) {
      const category = await repository.findById(id);

      if (!category) {
        throw createNotFoundError(id);
      }

      return category;
    },
    async createCategory(input) {
      const slug = resolveSlug(input.slug);
      const existingCategory = await repository.findBySlug(slug);

      if (existingCategory) {
        throw createSlugConflictError(slug);
      }

      const timestamp = now();
      const category: NewCategory = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        name: input.name,
        slug,
      };

      try {
        return await repository.create(category);
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(slug);
        }

        throw error;
      }
    },
    async updateCategory(id, input) {
      const existingCategory = await repository.findById(id);

      if (!existingCategory) {
        throw createNotFoundError(id);
      }

      const resolvedSlug =
        input.slug !== undefined ? resolveSlug(input.slug) : undefined;

      if (resolvedSlug && resolvedSlug !== existingCategory.slug) {
        const duplicateCategory = await repository.findBySlug(resolvedSlug);

        if (duplicateCategory && duplicateCategory.id !== id) {
          throw createSlugConflictError(resolvedSlug);
        }
      }

      try {
        const updatedCategory = await repository.update(id, {
          name: input.name,
          slug: resolvedSlug,
          updatedAt: now(),
        });

        if (!updatedCategory) {
          throw createNotFoundError(id);
        }

        return updatedCategory;
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(resolvedSlug ?? existingCategory.slug);
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
