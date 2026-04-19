import { renderToStaticMarkup } from "react-dom/server";

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { AdminHomeView } from "../../components/admin/admin-home-view";
import { getAdminResourceConfig } from "../../components/admin/admin-resource-config";
import {
  applyAdminBlogListResult,
  applyAdminLightweightListResult,
  getCreateBlogDraft,
} from "../../components/admin/admin-resource-page";
import { AdminResourceTablePage } from "../../components/admin/admin-resource-table-page";
import {
  type AdminDashboardData,
  type AdminListMeta,
  type BlogDraft,
  type CategoryDraft,
  type ChangelogDraft,
  type TagDraft,
} from "../../components/admin/admin-types";
import { BlogForm } from "../../components/admin/resource-forms/blog-form";
import { CategoryForm } from "../../components/admin/resource-forms/category-form";
import { ChangelogForm } from "../../components/admin/resource-forms/changelog-form";
import { TagForm } from "../../components/admin/resource-forms/tag-form";

const sampleData: AdminDashboardData = {
  categories: [
    {
      id: "cat_1",
      createdAt: new Date("2026-04-18T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-04-19T10:00:00.000Z").toISOString(),
      name: "Design",
      slug: "design",
      description: "Design notes",
    },
  ],
  tags: [
    {
      id: "tag_1",
      createdAt: new Date("2026-04-18T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-04-19T10:00:00.000Z").toISOString(),
      name: "UI",
      slug: "ui",
      description: "UI tag",
    },
  ],
  blogs: [
    {
      id: "blog_1",
      createdAt: new Date("2026-04-18T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-04-19T10:00:00.000Z").toISOString(),
      title: "Admin post",
      slug: "admin-post",
      description: "A post used in the admin test",
      cover: "",
      content: "## Markdown body",
      published: true,
      publishedAt: new Date("2026-04-19T08:00:00.000Z").toISOString(),
      featured: false,
      categoryId: "cat_1",
      category: {
        id: "cat_1",
        name: "Design",
        slug: "design",
      },
      tags: [
        {
          id: "tag_1",
          name: "UI",
          slug: "ui",
        },
      ],
    },
  ],
  changelogs: [
    {
      id: "change_1",
      createdAt: new Date("2026-04-18T10:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-04-19T10:00:00.000Z").toISOString(),
      version: "v1.0.0",
      content: "Initial release",
      releaseDate: "2026-04-19",
    },
  ],
};

test("app admin layout remains a server component boundary", () => {
  const layoutSource = readFileSync(
    path.join(process.cwd(), "app/admin/layout.tsx"),
    "utf8",
  );

  assert.doesNotMatch(layoutSource, /^"use client";/m);
  assert.doesNotMatch(layoutSource, /usePathname/);
  assert.match(layoutSource, /<AdminShell>/);
});

test("app admin home route remains wired to AdminHome", () => {
  const pageSource = readFileSync(
    path.join(process.cwd(), "app/admin/page.tsx"),
    "utf8",
  );

  assert.match(pageSource, /AdminHome/);
  assert.match(pageSource, /return <AdminHome \/>/);
});

test("obsolete split-layout admin files are removed", () => {
  assert.equal(
    existsSync(
      path.join(process.cwd(), "components/admin/admin-layout-shell.tsx"),
    ),
    false,
  );
  assert.equal(
    existsSync(
      path.join(process.cwd(), "components/admin/admin-resource-view.tsx"),
    ),
    false,
  );
});

test("AdminHomeView renders links to dedicated admin resource pages", () => {
  const html = renderToStaticMarkup(<AdminHomeView data={sampleData} />);

  assert.match(html, /Operations overview/);
  assert.match(html, /Quick access/);
  assert.match(html, /href="\/admin\/posts"/);
  assert.match(html, /href="\/admin\/categories"/);
  assert.match(html, /href="\/admin\/tags"/);
  assert.match(html, /href="\/admin\/changelog"/);
  assert.match(html, /Admin post/);
  assert.match(html, /1 published post/);
  assert.doesNotMatch(html, /<textarea/);
});

test("Posts admin route source remains wired to the shared resource page", () => {
  const pageSource = readFileSync(
    path.join(process.cwd(), "app/admin/posts/page.tsx"),
    "utf8",
  );

  assert.match(pageSource, /Suspense/);
  assert.match(pageSource, /fallback=/);
  assert.match(pageSource, /AdminResourcePage/);
  assert.match(pageSource, /resource="blogs"/);
  assert.match(pageSource, /title="Posts"/);
  assert.match(pageSource, /description=/);
});

test("Remaining admin resource routes stay wired to the shared resource page", () => {
  const routeSources = [
    {
      resource: "categories",
      source: readFileSync(
        path.join(process.cwd(), "app/admin/categories/page.tsx"),
        "utf8",
      ),
    },
    {
      resource: "tags",
      source: readFileSync(
        path.join(process.cwd(), "app/admin/tags/page.tsx"),
        "utf8",
      ),
    },
    {
      resource: "changelogs",
      source: readFileSync(
        path.join(process.cwd(), "app/admin/changelog/page.tsx"),
        "utf8",
      ),
    },
  ];

  for (const route of routeSources) {
    assert.match(route.source, /Suspense/);
    assert.match(route.source, /fallback=/);
    assert.match(route.source, /AdminResourcePage/);
    assert.match(route.source, new RegExp(`resource="${route.resource}"`));
  }
});

test("admin toolbar no longer advertises the removed search shortcut", () => {
  const toolbarSource = readFileSync(
    path.join(process.cwd(), "components/admin/admin-toolbar.tsx"),
    "utf8",
  );

  assert.doesNotMatch(toolbarSource, /Search admin/);
  assert.doesNotMatch(toolbarSource, /Ctrl K/);
  assert.doesNotMatch(toolbarSource, /ui-admin-toolbar-search/);
});

test("shared admin resource page stays on the table and drawer implementation", () => {
  const pageSource = readFileSync(
    path.join(process.cwd(), "components/admin/admin-resource-page.tsx"),
    "utf8",
  );

  assert.match(pageSource, /AdminResourceTablePage/);
  assert.doesNotMatch(pageSource, /AdminResourceView/);
});

test("lightweight resource reload clears edit selection when the active row leaves the current list", () => {
  const meta: AdminListMeta = {
    page: 2,
    pageSize: 20,
    total: 21,
  };

  const result = applyAdminLightweightListResult({
    currentDraft: {
      name: "Unsaved local title",
      slug: "design",
      description: "Unsaved local body",
    } satisfies CategoryDraft,
    currentDrawerMode: "edit",
    currentDrawerOpen: true,
    currentSelectedId: "cat_missing",
    data: sampleData,
    meta,
    resource: "categories",
  });

  assert.equal(result.selectedId, null);
  assert.equal(result.drawerOpen, false);
  assert.equal(result.drawerMode, "create");
  assert.deepEqual(result.draft, {
    name: "",
    slug: "",
    description: "",
  });
  assert.equal(result.listMeta, meta);
});

test("Posts resource page renders table chrome with the blog drawer form", () => {
  const html = renderToStaticMarkup(
    <AdminResourceTablePage
      config={getAdminResourceConfig("blogs")}
      drawerBody={
        <BlogForm
          canDelete={true}
          categories={sampleData.categories}
          draft={
            {
              title: "Admin post",
              slug: "admin-post",
              description: "A post used in the admin test",
              cover: "",
              content: "## Markdown body",
              categoryId: "cat_1",
              tagIds: ["tag_1"],
              published: true,
              publishedAt: "2026-04-19T08:00",
              featured: false,
            } satisfies BlogDraft
          }
          tags={sampleData.tags}
          onDraftChange={() => {}}
          onSubmit={() => {}}
          onToggleTag={() => {}}
        />
      }
      drawerMode="edit"
      drawerOpen={true}
      filterOptions={{
        categoryId: [{ label: "Design", value: "cat_1" }],
      }}
      filterValues={{
        categoryId: "cat_1",
        featured: false,
        published: true,
        query: "admin",
      }}
      items={[
        {
          id: "blog_1",
          title: "Admin post",
          slug: "admin-post",
          category: "Design",
          status: "Published",
          featured: false,
          publishedAt: "2026-04-19",
          updatedAt: "2026-04-19",
        },
      ]}
      page={1}
      pageSize={20}
      pending={false}
      resource="blogs"
      selectedRowId="blog_1"
      total={1}
      onCloseDrawer={() => {}}
      onCreate={() => {}}
      onFilterChange={() => {}}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onResetFilters={() => {}}
      onRowClick={() => {}}
    />,
  );

  assert.match(html, /Posts table/);
  assert.match(html, /Edit post/);
  assert.match(html, /<textarea[^>]*name="content"/);
  assert.match(html, /Save Post/);
  assert.match(html, /Delete Post/);
  assert.match(html, /Published/);
  assert.match(html, /Search posts by title or slug/);
  assert.match(html, /label[^>]*for="title"[^>]*>Title</);
  assert.match(html, /input[^>]*id="title"[^>]*name="title"/);
  assert.match(html, /label[^>]*for="categoryId"[^>]*>Category</);
  assert.match(html, /select[^>]*id="categoryId"[^>]*name="categoryId"/);
  assert.doesNotMatch(html, />Uncategorized</);
});

test("Categories resource page renders table chrome with the category drawer form", () => {
  const html = renderToStaticMarkup(
    <AdminResourceTablePage
      config={getAdminResourceConfig("categories")}
      drawerBody={
        <CategoryForm
          canDelete={true}
          draft={
            {
              name: "Design",
              slug: "design",
              description: "Design notes",
            } satisfies CategoryDraft
          }
          onDraftChange={() => {}}
          onSubmit={() => {}}
        />
      }
      drawerMode="edit"
      drawerOpen={true}
      filterValues={{
        query: "design",
      }}
      items={[
        {
          id: "cat_1",
          name: "Design",
          slug: "design",
          description: "Design notes",
          updatedAt: "2026-04-19",
        },
      ]}
      page={1}
      pageSize={20}
      pending={false}
      resource="categories"
      selectedRowId="cat_1"
      total={1}
      onCloseDrawer={() => {}}
      onCreate={() => {}}
      onFilterChange={() => {}}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onResetFilters={() => {}}
      onRowClick={() => {}}
    />,
  );

  assert.match(html, /Categories table/);
  assert.match(html, /Edit category/);
  assert.match(html, /Save Category/);
  assert.match(html, /Delete Category/);
  assert.match(html, /Search categories by name or slug/);
  assert.match(html, /label[^>]*for="name"[^>]*>Name</);
  assert.match(html, /input[^>]*id="name"[^>]*name="name"/);
  assert.match(html, /label[^>]*for="slug"[^>]*>Slug</);
  assert.match(html, /textarea[^>]*id="description"[^>]*name="description"/);
});

test("Tags resource page renders table chrome with the tag drawer form", () => {
  const html = renderToStaticMarkup(
    <AdminResourceTablePage
      config={getAdminResourceConfig("tags")}
      drawerBody={
        <TagForm
          canDelete={true}
          draft={
            {
              name: "UI",
              slug: "ui",
              description: "UI tag",
            } satisfies TagDraft
          }
          onDraftChange={() => {}}
          onSubmit={() => {}}
        />
      }
      drawerMode="edit"
      drawerOpen={true}
      filterValues={{
        query: "ui",
      }}
      items={[
        {
          id: "tag_1",
          name: "UI",
          slug: "ui",
          description: "UI tag",
          updatedAt: "2026-04-19",
        },
      ]}
      page={1}
      pageSize={20}
      pending={false}
      resource="tags"
      selectedRowId="tag_1"
      total={1}
      onCloseDrawer={() => {}}
      onCreate={() => {}}
      onFilterChange={() => {}}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onResetFilters={() => {}}
      onRowClick={() => {}}
    />,
  );

  assert.match(html, /Tags table/);
  assert.match(html, /Edit tag/);
  assert.match(html, /Save Tag/);
  assert.match(html, /Delete Tag/);
  assert.match(html, /Search tags by name or slug/);
  assert.match(html, /label[^>]*for="name"[^>]*>Name</);
  assert.match(html, /input[^>]*id="slug"[^>]*name="slug"/);
  assert.match(html, /textarea[^>]*id="description"[^>]*name="description"/);
});

test("Changelog resource page renders table chrome with the changelog drawer form", () => {
  const html = renderToStaticMarkup(
    <AdminResourceTablePage
      config={getAdminResourceConfig("changelogs")}
      drawerBody={
        <ChangelogForm
          canDelete={true}
          draft={
            {
              version: "v1.0.0",
              content: "Initial release",
              releaseDate: "2026-04-19",
            } satisfies ChangelogDraft
          }
          onDraftChange={() => {}}
          onSubmit={() => {}}
        />
      }
      drawerMode="edit"
      drawerOpen={true}
      filterValues={{
        query: "v1.0.0",
      }}
      items={[
        {
          id: "change_1",
          version: "v1.0.0",
          releaseDate: "2026-04-19",
          contentPreview: "Initial release",
          updatedAt: "2026-04-19",
        },
      ]}
      page={1}
      pageSize={20}
      pending={false}
      resource="changelogs"
      selectedRowId="change_1"
      total={1}
      onCloseDrawer={() => {}}
      onCreate={() => {}}
      onFilterChange={() => {}}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onResetFilters={() => {}}
      onRowClick={() => {}}
    />,
  );

  assert.match(html, /Changelog table/);
  assert.match(html, /Edit entry/);
  assert.match(html, /Save Entry/);
  assert.match(html, /Delete Entry/);
  assert.match(html, /Search changelog versions/);
  assert.match(html, /label[^>]*for="version"[^>]*>Version</);
  assert.match(html, /input[^>]*id="releaseDate"[^>]*name="releaseDate"/);
  assert.match(html, /textarea[^>]*id="content"[^>]*name="content"/);
});

test("getCreateBlogDraft seeds a valid category when categories exist", () => {
  assert.equal(getCreateBlogDraft(sampleData.categories).categoryId, "cat_1");
  assert.equal(getCreateBlogDraft([]).categoryId, "");
});

test("applyAdminBlogListResult preserves in-progress blog draft and edit target across list refreshes", () => {
  const meta: AdminListMeta = {
    page: 2,
    pageSize: 20,
    total: 21,
  };

  const result = applyAdminBlogListResult({
    blogs: sampleData.blogs,
    categories: sampleData.categories,
    currentDraft: {
      ...getCreateBlogDraft(sampleData.categories),
      title: "Unsaved local title",
      content: "Unsaved local body",
    },
    currentSelectedId: "blog_1",
    meta,
    tags: sampleData.tags,
  });

  assert.equal(result.selectedId, "blog_1");
  assert.equal(result.listMeta, meta);
  assert.equal(result.data.blogs[0]?.id, "blog_1");
  assert.equal(result.draft.title, "Unsaved local title");
  assert.equal(result.draft.content, "Unsaved local body");
  assert.equal(result.draft.categoryId, "cat_1");
});

void ({} as CategoryDraft);
void ({} as TagDraft);
