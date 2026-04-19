import type { AdminResourceConfig, ResourceSection } from "./admin-types";

const resourceConfigs = {
  blogs: {
    resource: "blogs",
    title: "Posts",
    description: "Manage posts, publication state, and taxonomy coverage.",
    createLabel: "Add Post",
    columns: [
      { key: "title", label: "Title" },
      { key: "slug", label: "Slug" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "featured", label: "Featured" },
      { key: "publishedAt", label: "Published At" },
      { key: "updatedAt", label: "Updated At" },
    ],
    searchableFields: ["title", "slug"],
    filters: [
      {
        key: "query",
        label: "Search",
        kind: "search",
        placeholder: "Search posts by title or slug",
      },
      { key: "published", label: "Published", kind: "boolean" },
      { key: "categoryId", label: "Category", kind: "select" },
      { key: "featured", label: "Featured", kind: "boolean" },
    ],
    sortKeys: ["publishedAt", "updatedAt", "title"],
    defaultListParams: {
      page: 1,
      pageSize: 20,
      sortBy: "publishedAt",
      sortDirection: "desc",
    },
    drawer: {
      createTitle: "Create post",
      editTitle: "Edit post",
      description: "Update metadata, taxonomy, and plain-text content fields.",
    },
    view: {
      emptyTitle: "No posts found",
      emptyDescription: "Create a post or broaden the current table filters.",
    },
    form: {
      submitLabel: "Save Post",
      deleteLabel: "Delete Post",
    },
  },
  categories: {
    resource: "categories",
    title: "Categories",
    description: "Maintain the category structure used across published work.",
    createLabel: "Add Category",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" },
      { key: "updatedAt", label: "Updated At" },
    ],
    searchableFields: ["name", "slug"],
    filters: [
      {
        key: "query",
        label: "Search",
        kind: "search",
        placeholder: "Search categories by name or slug",
      },
    ],
    sortKeys: ["createdAt", "updatedAt", "name"],
    defaultListParams: {
      page: 1,
      pageSize: 20,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    drawer: {
      createTitle: "Create category",
      editTitle: "Edit category",
      description: "Edit category names, slugs, and descriptions.",
    },
    view: {
      emptyTitle: "No categories found",
      emptyDescription: "Categories will appear here once records are created.",
    },
    form: {
      submitLabel: "Save Category",
      deleteLabel: "Delete Category",
    },
  },
  tags: {
    resource: "tags",
    title: "Tags",
    description: "Organize reusable labels for discovery and editorial flow.",
    createLabel: "Add Tag",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" },
      { key: "updatedAt", label: "Updated At" },
    ],
    searchableFields: ["name", "slug"],
    filters: [
      {
        key: "query",
        label: "Search",
        kind: "search",
        placeholder: "Search tags by name or slug",
      },
    ],
    sortKeys: ["createdAt", "updatedAt", "name"],
    defaultListParams: {
      page: 1,
      pageSize: 20,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    drawer: {
      createTitle: "Create tag",
      editTitle: "Edit tag",
      description:
        "Update tag metadata without leaving the current list context.",
    },
    view: {
      emptyTitle: "No tags found",
      emptyDescription: "Tags will appear here once records are created.",
    },
    form: {
      submitLabel: "Save Tag",
      deleteLabel: "Delete Tag",
    },
  },
  changelogs: {
    resource: "changelogs",
    title: "Changelog",
    description: "Track release notes and update history in one place.",
    createLabel: "Add Entry",
    columns: [
      { key: "version", label: "Version" },
      { key: "releaseDate", label: "Release Date" },
      { key: "contentPreview", label: "Content Preview" },
      { key: "updatedAt", label: "Updated At" },
    ],
    searchableFields: ["version"],
    filters: [
      {
        key: "query",
        label: "Search",
        kind: "search",
        placeholder: "Search changelog versions",
      },
    ],
    sortKeys: ["releaseDate", "updatedAt"],
    defaultListParams: {
      page: 1,
      pageSize: 20,
      sortBy: "releaseDate",
      sortDirection: "desc",
    },
    drawer: {
      createTitle: "Create entry",
      editTitle: "Edit entry",
      description: "Edit metadata and long-form release notes.",
    },
    view: {
      emptyTitle: "No changelog entries found",
      emptyDescription:
        "Create a release note entry or change the active search state.",
    },
    form: {
      submitLabel: "Save Entry",
      deleteLabel: "Delete Entry",
    },
  },
} satisfies Record<ResourceSection, AdminResourceConfig>;

export function getAdminResourceConfig(resource: ResourceSection) {
  return resourceConfigs[resource];
}

export const adminResourceConfigs = resourceConfigs;
