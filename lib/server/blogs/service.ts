import { generateCuid } from "@/lib/cuid";
import type { Blog, Category, NewBlog, Tag } from "@/lib/db/schema";
import type {
  AdminBlogCreateInput,
  AdminBlogListQuery,
  AdminBlogUpdateInput,
  PublicBlogListQuery,
} from "@/lib/server/blogs/dto";
import { computeReadTimeMinutes, slugify } from "@/lib/server/content-utils";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import { blogRepository, type BlogRepository } from "./repository";

export type BlogCategorySummary = Pick<Category, "id" | "name" | "slug">;
export type BlogTagSummary = Pick<Tag, "id" | "name" | "slug">;
export type BlogReadModel = Blog & {
  category: BlogCategorySummary | null;
  tags: BlogTagSummary[];
};

export interface BlogRepository {
  listAdmin(query: AdminBlogListQuery): Promise<{
    items: BlogReadModel[];
    total: number;
  }>;
  listPublic(query: PublicBlogListQuery): Promise<{
    items: BlogReadModel[];
    total: number;
  }>;
  findById(id: string): Promise<BlogReadModel | null>;
  findBySlug(slug: string): Promise<BlogReadModel | null>;
  listSimilar(
    blogId: string,
    categoryId: string,
    tagIds: string[],
    limit: number,
  ): Promise<BlogReadModel[]>;
  findCategoryById(id: string): Promise<Pick<Category, "id"> | null>;
  findTagsByIds(ids: string[]): Promise<Array<Pick<Tag, "id">>>;
  create(blog: NewBlog, options: BlogTagIds): Promise<BlogReadModel>;
  update(
    id: string,
    blog: BlogUpdateMutation,
    options: BlogUpdateOptions,
  ): Promise<BlogReadModel | null>;
  delete(id: string): Promise<boolean>;
}

type BlogTagIds = {
  tagIds: string[];
};

type BlogUpdateMutation = Partial<
  Pick<
    NewBlog,
    | "title"
    | "slug"
    | "description"
    | "content"
    | "coverImage"
    | "featured"
    | "published"
    | "publishedAt"
    | "readTimeMinutes"
    | "categoryId"
  >
> & {
  updatedAt: Date;
};

type BlogUpdateOptions = {
  replaceTagIds?: string[];
};

export interface BlogService {
  listAdminBlogs(query: AdminBlogListQuery): Promise<{
    items: BlogReadModel[];
    total: number;
  }>;
  listPublicBlogs(query: PublicBlogListQuery): Promise<{
    items: BlogReadModel[];
    total: number;
  }>;
  getAdminBlog(id: string): Promise<BlogReadModel>;
  getPublicBlogBySlug(slug: string): Promise<BlogReadModel>;
  getPublicSimilarBlogs(slug: string, limit: number): Promise<BlogReadModel[]>;
  createBlog(input: AdminBlogCreateInput): Promise<BlogReadModel>;
  updateBlog(id: string, input: AdminBlogUpdateInput): Promise<BlogReadModel>;
  deleteBlog(id: string): Promise<void>;
}

export interface BlogServiceDeps {
  repository?: BlogRepository;
  now?: () => Date;
  generateId?: () => string;
}

const BLOG_SLUG_CONSTRAINT = "blogs_slug_key";
const BLOG_CATEGORY_FK_CONSTRAINT = "blogs_category_id_fkey";
const BLOG_TAG_FK_CONSTRAINT = "blog_tags_tag_id_fkey";

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.BLOG_NOT_FOUND, "Blog not found", 404, {
    id,
  });

const createSlugConflictError = (slug: string) =>
  new AppError(
    ERROR_CODES.BLOG_SLUG_CONFLICT,
    "Blog slug already exists",
    409,
    { slug },
  );

const createCategoryNotFoundError = (categoryId: string) =>
  new AppError(
    ERROR_CODES.BLOG_CATEGORY_NOT_FOUND,
    "Blog category not found",
    404,
    {
      categoryId,
    },
  );

const createTagsNotFoundError = (missingTagIds: string[]) =>
  new AppError(ERROR_CODES.BLOG_TAGS_NOT_FOUND, "Blog tags not found", 404, {
    missingTagIds,
  });

const isDuplicateSlugError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const { code, constraint } = error as {
    code?: unknown;
    constraint?: unknown;
  };

  return (
    code === "23505" &&
    (constraint === undefined || constraint === BLOG_SLUG_CONSTRAINT)
  );
};

const getForeignKeyConstraint = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const { code, constraint } = error as {
    code?: unknown;
    constraint?: unknown;
  };

  return code === "23503" && typeof constraint === "string" ? constraint : null;
};

const normalizeWriteForeignKeyError = ({
  error,
  categoryId,
  tagIds,
}: {
  error: unknown;
  categoryId?: string;
  tagIds?: string[];
}) => {
  const constraint = getForeignKeyConstraint(error);

  if (constraint === BLOG_CATEGORY_FK_CONSTRAINT && categoryId !== undefined) {
    return createCategoryNotFoundError(categoryId);
  }

  if (constraint === BLOG_TAG_FK_CONSTRAINT && tagIds !== undefined) {
    return createTagsNotFoundError(tagIds);
  }

  return null;
};

const dedupeTagIds = (tagIds?: string[]) => [...new Set(tagIds ?? [])];

const resolveSlug = (title: string, slug?: string) => {
  const resolvedSlug = slugify(slug ?? title);

  if (!resolvedSlug) {
    throw new AppError(
      ERROR_CODES.COMMON_VALIDATION_ERROR,
      "Blog slug cannot be empty",
      400,
    );
  }

  return resolvedSlug;
};

async function ensureCategoryExists(
  repository: BlogRepository,
  categoryId: string,
) {
  const category = await repository.findCategoryById(categoryId);

  if (!category) {
    throw createCategoryNotFoundError(categoryId);
  }
}

async function validateTagIds(repository: BlogRepository, tagIds?: string[]) {
  const uniqueTagIds = dedupeTagIds(tagIds);

  if (uniqueTagIds.length === 0) {
    return uniqueTagIds;
  }

  const foundTags = await repository.findTagsByIds(uniqueTagIds);
  const foundTagIds = new Set(foundTags.map((tag) => tag.id));
  const missingTagIds = uniqueTagIds.filter((tagId) => !foundTagIds.has(tagId));

  if (missingTagIds.length > 0) {
    throw createTagsNotFoundError(missingTagIds);
  }

  return uniqueTagIds;
}

export function createBlogService({
  repository = blogRepository,
  now = () => new Date(),
  generateId = generateCuid,
}: BlogServiceDeps = {}): BlogService {
  return {
    listAdminBlogs(query) {
      return repository.listAdmin(query);
    },
    listPublicBlogs(query) {
      return repository.listPublic(query);
    },
    async getAdminBlog(id) {
      const blog = await repository.findById(id);

      if (!blog) {
        throw createNotFoundError(id);
      }

      return blog;
    },
    async getPublicBlogBySlug(slug) {
      const blog = await repository.findBySlug(slug);

      if (!blog || !blog.published) {
        throw createNotFoundError(slug);
      }

      return blog;
    },
    async getPublicSimilarBlogs(slug, limit) {
      const blog = await repository.findBySlug(slug);

      if (!blog || !blog.published) {
        throw createNotFoundError(slug);
      }

      return repository.listSimilar(
        blog.id,
        blog.categoryId,
        blog.tags.map((tag) => tag.id),
        limit,
      );
    },
    async createBlog(input) {
      const slug = resolveSlug(input.title, input.slug);
      const existingBlog = await repository.findBySlug(slug);

      if (existingBlog) {
        throw createSlugConflictError(slug);
      }

      await ensureCategoryExists(repository, input.categoryId);
      const tagIds = await validateTagIds(repository, input.tagIds);
      const timestamp = now();
      const shouldPublishAt =
        input.publishedAt === undefined
          ? input.published
            ? timestamp
            : null
          : input.publishedAt;
      const blog: NewBlog = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        title: input.title,
        slug,
        description: input.description,
        content: input.content,
        coverImage: input.coverImage ?? "",
        featured: input.featured,
        published: input.published,
        publishedAt: shouldPublishAt,
        readTimeMinutes: computeReadTimeMinutes(input.content),
        categoryId: input.categoryId,
      };

      try {
        return await repository.create(blog, { tagIds });
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(slug);
        }

        const normalizedError = normalizeWriteForeignKeyError({
          error,
          categoryId: input.categoryId,
          tagIds,
        });

        if (normalizedError) {
          throw normalizedError;
        }

        throw error;
      }
    },
    async updateBlog(id, input) {
      const existingBlog = await repository.findById(id);

      if (!existingBlog) {
        throw createNotFoundError(id);
      }

      const resolvedSlug =
        input.title !== undefined || input.slug !== undefined
          ? resolveSlug(input.title ?? existingBlog.title, input.slug)
          : undefined;

      if (resolvedSlug && resolvedSlug !== existingBlog.slug) {
        const duplicateBlog = await repository.findBySlug(resolvedSlug);

        if (duplicateBlog && duplicateBlog.id !== id) {
          throw createSlugConflictError(resolvedSlug);
        }
      }

      if (input.categoryId && input.categoryId !== existingBlog.categoryId) {
        await ensureCategoryExists(repository, input.categoryId);
      }

      const mutation: BlogUpdateMutation = {
        updatedAt: now(),
      };

      if (input.title !== undefined) {
        mutation.title = input.title;
      }
      if (resolvedSlug !== undefined) {
        mutation.slug = resolvedSlug;
      }
      if (input.description !== undefined) {
        mutation.description = input.description;
      }
      if (input.content !== undefined) {
        mutation.content = input.content;
        mutation.readTimeMinutes = computeReadTimeMinutes(input.content);
      }
      if (input.coverImage !== undefined) {
        mutation.coverImage = input.coverImage;
      }
      if (input.featured !== undefined) {
        mutation.featured = input.featured;
      }
      if (input.published !== undefined) {
        mutation.published = input.published;

        if (
          input.published &&
          existingBlog.publishedAt === null &&
          input.publishedAt === undefined
        ) {
          mutation.publishedAt = now();
        }
      }
      if (input.publishedAt !== undefined) {
        mutation.publishedAt = input.publishedAt;
      }
      if (input.categoryId !== undefined) {
        mutation.categoryId = input.categoryId;
      }

      const options: BlogUpdateOptions = {};

      if (input.tagIds !== undefined) {
        options.replaceTagIds = await validateTagIds(repository, input.tagIds);
      }

      try {
        const updatedBlog = await repository.update(id, mutation, options);

        if (!updatedBlog) {
          throw createNotFoundError(id);
        }

        return updatedBlog;
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(resolvedSlug ?? existingBlog.slug);
        }

        const normalizedError = normalizeWriteForeignKeyError({
          error,
          categoryId: input.categoryId,
          tagIds: options.replaceTagIds,
        });

        if (normalizedError) {
          throw normalizedError;
        }

        throw error;
      }
    },
    async deleteBlog(id) {
      const existingBlog = await repository.findById(id);

      if (!existingBlog) {
        throw createNotFoundError(id);
      }

      const deleted = await repository.delete(id);

      if (!deleted) {
        throw createNotFoundError(id);
      }
    },
  };
}

export const blogService = createBlogService();
