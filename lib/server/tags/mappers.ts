import type { TagReadModel } from "./service";

export type PublicTag = {
  name: string;
  slug: string;
  postCount: number;
};

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  blogCount: number;
  publishedBlogCount: number;
  createdAt: string;
  updatedAt: string;
};

export function toPublicTag(tag: TagReadModel): PublicTag {
  return {
    name: tag.name,
    slug: tag.slug,
    postCount: tag.publishedBlogCount,
  };
}

export function toAdminTag(tag: TagReadModel): AdminTag {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    blogCount: tag.blogCount,
    publishedBlogCount: tag.publishedBlogCount,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}
