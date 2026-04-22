import { resolveBlogCoverImage } from "@/lib/blog-cover-image";

import type { BlogReadModel } from "./service";

import { formatPublicDate } from "../content-utils";

export type PublicBlog = {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  featured?: boolean;
};

export type AdminBlog = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  readTimeMinutes: number;
  categoryId: string;
  category: BlogReadModel["category"];
  tagIds: string[];
  tags: BlogReadModel["tags"];
  createdAt: string;
  updatedAt: string;
};

export function toPublicBlog(blog: BlogReadModel): PublicBlog {
  return {
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    content: blog.content,
    date: formatPublicDate(blog.publishedAt ?? blog.createdAt),
    category: blog.category?.name ?? "",
    tags: blog.tags.map((tag) => tag.slug),
    coverImage: resolveBlogCoverImage(blog.coverImage),
    readTime: `${blog.readTimeMinutes} min read`,
    featured: blog.featured,
  };
}

export function toAdminBlog(blog: BlogReadModel): AdminBlog {
  return {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    content: blog.content,
    coverImage: blog.coverImage,
    featured: blog.featured,
    published: blog.published,
    publishedAt: blog.publishedAt?.toISOString() ?? null,
    readTimeMinutes: blog.readTimeMinutes,
    categoryId: blog.categoryId,
    category: blog.category,
    tagIds: blog.tags.map((tag) => tag.id),
    tags: blog.tags,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
}
