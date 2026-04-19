export type CategoryRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string;
};

export type TagRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string;
};

export type BlogRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: string;
  description: string;
  cover: string;
  content: string;
  published: boolean;
  publishedAt: string | null;
  featured: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

export type ChangelogRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  content: string;
  releaseDate: string | null;
};

export type AdminDashboardData = {
  categories: CategoryRecord[];
  tags: TagRecord[];
  blogs: BlogRecord[];
  changelogs: ChangelogRecord[];
};

export type ResourceSection = "categories" | "tags" | "blogs" | "changelogs";

export type CategoryDraft = {
  name: string;
  slug: string;
  description: string;
};

export type TagDraft = {
  name: string;
  slug: string;
  description: string;
};

export type BlogDraft = {
  title: string;
  slug: string;
  description: string;
  cover: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  published: boolean;
  publishedAt: string;
  featured: boolean;
};

export type ChangelogDraft = {
  version: string;
  content: string;
  releaseDate: string;
};

export type DraftByResource = {
  categories: CategoryDraft;
  tags: TagDraft;
  blogs: BlogDraft;
  changelogs: ChangelogDraft;
};
