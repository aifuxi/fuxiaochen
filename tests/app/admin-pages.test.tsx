import { renderToStaticMarkup } from "react-dom/server";

import assert from "node:assert/strict";
import test from "node:test";

import { AdminHomeView } from "../../components/admin/admin-home-view";
import { AdminResourceView } from "../../components/admin/admin-resource-view";
import {
  type AdminDashboardData,
  type BlogDraft,
  type CategoryDraft,
  type ChangelogDraft,
  type TagDraft,
} from "../../components/admin/admin-types";

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

test("AdminHomeView renders links to dedicated admin resource pages", () => {
  const html = renderToStaticMarkup(<AdminHomeView data={sampleData} />);

  assert.match(html, /href="\/admin\/posts"/);
  assert.match(html, /href="\/admin\/categories"/);
  assert.match(html, /href="\/admin\/tags"/);
  assert.match(html, /href="\/admin\/changelog"/);
  assert.doesNotMatch(html, /<textarea/);
});

test("AdminResourceView renders only the selected posts editor", () => {
  const html = renderToStaticMarkup(
    <AdminResourceView
      data={sampleData}
      resource="blogs"
      title="Posts"
      description="Manage posts"
      selectedId="blog_1"
      pending={false}
      errorMessage=""
      feedbackMessage=""
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
      onCreate={() => {}}
      onDelete={() => {}}
      onRefresh={() => {}}
      onSelect={() => {}}
      onSubmit={() => {}}
      onDraftChange={() => {}}
      onToggleBlogTag={() => {}}
    />,
  );

  assert.match(html, /<textarea[^>]*name="content"/);
  assert.doesNotMatch(html, /<textarea[^>]*name="changelogContent"/);
  assert.match(html, /Published/);
});

test("AdminResourceView renders only the changelog editor on changelog pages", () => {
  const html = renderToStaticMarkup(
    <AdminResourceView
      data={sampleData}
      resource="changelogs"
      title="Changelog"
      description="Manage changelog"
      selectedId="change_1"
      pending={false}
      errorMessage=""
      feedbackMessage=""
      draft={
        {
          version: "v1.0.0",
          content: "Initial release",
          releaseDate: "2026-04-19",
        } satisfies ChangelogDraft
      }
      onCreate={() => {}}
      onDelete={() => {}}
      onRefresh={() => {}}
      onSelect={() => {}}
      onSubmit={() => {}}
      onDraftChange={() => {}}
      onToggleBlogTag={() => {}}
    />,
  );

  assert.match(html, /<textarea[^>]*name="changelogContent"/);
  assert.doesNotMatch(html, /<textarea[^>]*name="content"/);
  assert.match(html, /Version/);
});

void ({} as CategoryDraft);
void ({} as TagDraft);
