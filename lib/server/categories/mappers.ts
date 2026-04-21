import type { CategoryReadModel } from "./service";

export type PublicCategory = {
  name: string;
  slug: string;
  postCount: number;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  blogCount: number;
  publishedBlogCount: number;
  createdAt: string;
  updatedAt: string;
};

export function toPublicCategory(category: CategoryReadModel): PublicCategory {
  return {
    name: category.name,
    slug: category.slug,
    postCount: category.publishedBlogCount,
  };
}

export function toAdminCategory(category: CategoryReadModel): AdminCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    blogCount: category.blogCount,
    publishedBlogCount: category.publishedBlogCount,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}
