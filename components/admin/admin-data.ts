"use client";

import type {
  AdminDashboardData,
  BlogDraft,
  BlogRecord,
  CategoryDraft,
  CategoryRecord,
  ChangelogDraft,
  ChangelogRecord,
  DraftByResource,
  ResourceSection,
  TagDraft,
  TagRecord,
} from "./admin-types";

type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

type ApiErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const emptyData: AdminDashboardData = {
  categories: [],
  tags: [],
  blogs: [],
  changelogs: [],
};

export const emptyCategoryDraft = (): CategoryDraft => ({
  name: "",
  slug: "",
  description: "",
});

export const emptyTagDraft = (): TagDraft => ({
  name: "",
  slug: "",
  description: "",
});

export const emptyBlogDraft = (): BlogDraft => ({
  title: "",
  slug: "",
  description: "",
  cover: "",
  content: "",
  categoryId: "",
  tagIds: [],
  published: false,
  publishedAt: "",
  featured: false,
});

export const emptyChangelogDraft = (): ChangelogDraft => ({
  version: "",
  content: "",
  releaseDate: "",
});

export const buildCategoryDraft = (
  category?: CategoryRecord | null,
): CategoryDraft => ({
  name: category?.name ?? "",
  slug: category?.slug ?? "",
  description: category?.description ?? "",
});

export const buildTagDraft = (tag?: TagRecord | null): TagDraft => ({
  name: tag?.name ?? "",
  slug: tag?.slug ?? "",
  description: tag?.description ?? "",
});

export const toDateTimeLocalValue = (value: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return utcDate.toISOString().slice(0, 16);
};

export const buildBlogDraft = (blog?: BlogRecord | null): BlogDraft => ({
  title: blog?.title ?? "",
  slug: blog?.slug ?? "",
  description: blog?.description ?? "",
  cover: blog?.cover ?? "",
  content: blog?.content ?? "",
  categoryId: blog?.categoryId ?? "",
  tagIds: blog?.tags.map((tag) => tag.id) ?? [],
  published: blog?.published ?? false,
  publishedAt: toDateTimeLocalValue(blog?.publishedAt ?? null),
  featured: blog?.featured ?? false,
});

export const buildChangelogDraft = (
  changelog?: ChangelogRecord | null,
): ChangelogDraft => ({
  version: changelog?.version ?? "",
  content: changelog?.content ?? "",
  releaseDate: changelog?.releaseDate ?? "",
});

export async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as
    | ApiSuccessEnvelope<T>
    | ApiErrorEnvelope;

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.success
        ? "Request failed"
        : payload.error.message || "Request failed",
    );
  }

  return payload.data;
}

export async function fetchList<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  return parseResponse<{ items: T[] }>(response).then((data) => data.items);
}

export async function fetchDashboardData() {
  const [categories, tags, blogs, changelogs] = await Promise.all([
    fetchList<CategoryRecord>("/api/categories?page=1&pageSize=100"),
    fetchList<TagRecord>("/api/tags?page=1&pageSize=100"),
    fetchList<BlogRecord>("/api/blogs?page=1&pageSize=100"),
    fetchList<ChangelogRecord>("/api/changelogs?page=1&pageSize=100"),
  ]);

  return {
    categories,
    tags,
    blogs,
    changelogs,
  } satisfies AdminDashboardData;
}

export const pickSelectedId = <T extends { id: string }>(
  items: T[],
  preferred: string | null,
) => {
  if (preferred && items.some((item) => item.id === preferred)) {
    return preferred;
  }

  return items[0]?.id ?? null;
};

export function getEmptyDraft<TResource extends ResourceSection>(
  resource: TResource,
): DraftByResource[TResource] {
  switch (resource) {
    case "categories":
      return emptyCategoryDraft() as DraftByResource[TResource];
    case "tags":
      return emptyTagDraft() as DraftByResource[TResource];
    case "blogs":
      return emptyBlogDraft() as DraftByResource[TResource];
    case "changelogs":
      return emptyChangelogDraft() as DraftByResource[TResource];
  }
}

export function getDraftForResource<TResource extends ResourceSection>(
  data: AdminDashboardData,
  resource: TResource,
  id: string | null,
): DraftByResource[TResource] {
  switch (resource) {
    case "categories":
      return buildCategoryDraft(
        data.categories.find((category) => category.id === id) ?? null,
      ) as DraftByResource[TResource];
    case "tags":
      return buildTagDraft(
        data.tags.find((tag) => tag.id === id) ?? null,
      ) as DraftByResource[TResource];
    case "blogs":
      return buildBlogDraft(
        data.blogs.find((blog) => blog.id === id) ?? null,
      ) as DraftByResource[TResource];
    case "changelogs":
      return buildChangelogDraft(
        data.changelogs.find((changelog) => changelog.id === id) ?? null,
      ) as DraftByResource[TResource];
  }
}

export function buildResourcePayload<TResource extends ResourceSection>(
  resource: TResource,
  draft: DraftByResource[TResource],
) {
  if (resource === "blogs") {
    const blogDraft = draft as BlogDraft;

    return {
      title: blogDraft.title,
      slug: blogDraft.slug,
      description: blogDraft.description,
      cover: blogDraft.cover,
      content: blogDraft.content,
      categoryId: blogDraft.categoryId,
      tagIds: blogDraft.tagIds,
      published: blogDraft.published,
      publishedAt: blogDraft.publishedAt
        ? new Date(blogDraft.publishedAt).toISOString()
        : null,
      featured: blogDraft.featured,
    };
  }

  if (resource === "changelogs") {
    const changelogDraft = draft as ChangelogDraft;

    return {
      version: changelogDraft.version,
      content: changelogDraft.content,
      releaseDate: changelogDraft.releaseDate || null,
    };
  }

  return draft;
}
