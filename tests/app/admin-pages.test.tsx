import { renderToStaticMarkup } from "react-dom/server";

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { AdminHomeView } from "../../components/admin/admin-home-view";
import { AdminResourceView } from "../../components/admin/admin-resource-view";
import { AdminShellFrame } from "../../components/admin/admin-shell";
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

test("AdminShell renders grouped navigation and toolbar chrome", () => {
  const html = renderToStaticMarkup(
    <AdminShellFrame pathname="/admin/posts">
      <section>
        <h1>Posts page heading</h1>
        <p>Shell content</p>
      </section>
    </AdminShellFrame>,
  );

  assert.match(html, /Workspace/);
  assert.match(html, /Content/);
  assert.match(html, /href="\/admin"/);
  assert.match(html, /href="\/admin\/posts"/);
  assert.match(html, /href="\/admin\/categories"/);
  assert.match(html, /href="\/admin\/tags"/);
  assert.match(html, /href="\/admin\/changelog"/);
  assert.match(html, /aria-current="page"[^>]*href="\/admin\/posts"/);
  assert.match(html, />Posts</);
  assert.equal(html.match(/<h1/g)?.length ?? 0, 1);
  assert.match(html, /<h1[^>]*>Posts page heading</);
  assert.match(html, /<h2[^>]*>Posts</);
  assert.match(
    html,
    /Manage posts, publication state, and taxonomy coverage\./,
  );
  assert.match(html, />Search admin</);
  assert.match(html, />Open site</);
  assert.match(html, /Shell content/);
});

test("AdminShell uses neutral toolbar context on unknown admin paths", () => {
  const html = renderToStaticMarkup(
    <AdminShellFrame pathname="/admin/experiments">
      <section>Unknown admin content</section>
    </AdminShellFrame>,
  );

  assert.match(html, /<h2[^>]*>Admin workspace</);
  assert.match(
    html,
    /Select a known admin section to review content, taxonomy, or release history\./,
  );
  assert.doesNotMatch(html, /aria-current="page"/);
  assert.doesNotMatch(html, /<h2[^>]*>Dashboard</);
});

test("app admin layout remains a server component boundary", () => {
  const layoutSource = readFileSync(
    path.join(process.cwd(), "app/admin/layout.tsx"),
    "utf8",
  );

  assert.doesNotMatch(layoutSource, /^"use client";/m);
  assert.doesNotMatch(layoutSource, /usePathname/);
  assert.match(layoutSource, /<AdminShell>/);
});

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
