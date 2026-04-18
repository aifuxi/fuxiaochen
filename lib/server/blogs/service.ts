import { generateCuid } from "@/lib/cuid";
import type { Blog, Category, NewBlog, Tag } from "@/lib/db/schema";
import type {
  BlogCreateInput,
  BlogListQuery,
  BlogUpdateInput,
} from "@/lib/server/blogs/dto";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

type BlogTagIds = {
  tagIds: string[];
};

type BlogUpdateMutation = Partial<
  Pick<
    NewBlog,
    | "title"
    | "slug"
    | "description"
    | "cover"
    | "content"
    | "published"
    | "publishedAt"
    | "featured"
    | "categoryId"
  >
> & {
  updatedAt: Date;
};

type BlogUpdateOptions = {
  replaceTagIds?: string[];
};

export interface BlogRepository {
  list(query: BlogListQuery): Promise<{
    items: Blog[];
    total: number;
  }>;
  findById(id: string): Promise<Blog | null>;
  findBySlug(slug: string): Promise<Blog | null>;
  findCategoryById(id: string): Promise<Pick<Category, "id"> | null>;
  findTagsByIds(ids: string[]): Promise<Array<Pick<Tag, "id">>>;
  create(blog: NewBlog, options: BlogTagIds): Promise<Blog>;
  update(
    id: string,
    blog: BlogUpdateMutation,
    options: BlogUpdateOptions,
  ): Promise<Blog | null>;
  delete(id: string): Promise<boolean>;
}

export interface BlogServiceDeps {
  repository: BlogRepository;
  now?: () => Date;
  generateId?: () => string;
}

export interface BlogService {
  listBlogs(query: BlogListQuery): Promise<{
    items: Blog[];
    total: number;
  }>;
  getBlog(id: string): Promise<Blog>;
  createBlog(input: BlogCreateInput): Promise<Blog>;
  updateBlog(id: string, input: BlogUpdateInput): Promise<Blog>;
  deleteBlog(id: string): Promise<void>;
}

const BLOG_SLUG_CONSTRAINT = "blogs_slug_key";

const createNotFoundError = (id: string) =>
  new AppError(ERROR_CODES.BLOG_NOT_FOUND, "Blog not found", 404, {
    id,
  });

const createSlugConflictError = (slug: string) =>
  new AppError(
    ERROR_CODES.BLOG_SLUG_CONFLICT,
    "Blog slug already exists",
    409,
    {
      slug,
    },
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

const dedupeTagIds = (tagIds?: string[]) => [...new Set(tagIds ?? [])];

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
  repository,
  now = () => new Date(),
  generateId = generateCuid,
}: BlogServiceDeps): BlogService {
  return {
    listBlogs(query: BlogListQuery) {
      return repository.list(query);
    },
    async getBlog(id) {
      const blog = await repository.findById(id);

      if (!blog) {
        throw createNotFoundError(id);
      }

      return blog;
    },
    async createBlog(input: BlogCreateInput) {
      const existingBlog = await repository.findBySlug(input.slug);

      if (existingBlog) {
        throw createSlugConflictError(input.slug);
      }

      await ensureCategoryExists(repository, input.categoryId);
      const tagIds = await validateTagIds(repository, input.tagIds);
      const timestamp = now();
      const blog: NewBlog = {
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        title: input.title,
        slug: input.slug,
        description: input.description,
        cover: input.cover ?? "",
        content: input.content,
        published: input.published,
        publishedAt: input.publishedAt ?? null,
        featured: input.featured,
        categoryId: input.categoryId,
      };

      try {
        return await repository.create(blog, { tagIds });
      } catch (error) {
        if (isDuplicateSlugError(error)) {
          throw createSlugConflictError(input.slug);
        }

        throw error;
      }
    },
    async updateBlog(id, input: BlogUpdateInput) {
      const existingBlog = await repository.findById(id);

      if (!existingBlog) {
        throw createNotFoundError(id);
      }

      if (input.slug && input.slug !== existingBlog.slug) {
        const duplicateBlog = await repository.findBySlug(input.slug);

        if (duplicateBlog && duplicateBlog.id !== id) {
          throw createSlugConflictError(input.slug);
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
      if (input.slug !== undefined) {
        mutation.slug = input.slug;
      }
      if (input.description !== undefined) {
        mutation.description = input.description;
      }
      if (input.cover !== undefined) {
        mutation.cover = input.cover;
      }
      if (input.content !== undefined) {
        mutation.content = input.content;
      }
      if (input.published !== undefined) {
        mutation.published = input.published;
      }
      if (input.publishedAt !== undefined) {
        mutation.publishedAt = input.publishedAt;
      }
      if (input.featured !== undefined) {
        mutation.featured = input.featured;
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
          throw createSlugConflictError(input.slug ?? existingBlog.slug);
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
