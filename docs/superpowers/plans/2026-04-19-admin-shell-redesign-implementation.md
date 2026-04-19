# Admin Shell Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the full `/admin` area into a shared dark admin shell with sidebar, toolbar, searchable/filterable/paginated resource tables, and drawer-based create/edit flows while keeping the existing project design system.

**Architecture:** Expand the existing CRUD list APIs so resource pages can request paginated, searchable, sortable slices instead of fetching the full dataset. On the client, replace the current split list/editor layout with a shared `AdminShell`, resource configuration, query-state helpers, reusable table primitives, and resource-specific drawer forms that continue to use plain `textarea` fields for long text.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4 utilities in `styles/global.css`, Zod, Drizzle ORM, Node test runner with `tsx`

---

## File Map

### Server query support

- Modify: `lib/server/blogs/dto.ts`
- Modify: `lib/server/blogs/handler.ts`
- Modify: `lib/server/blogs/service.ts`
- Modify: `lib/server/blogs/repository.ts`
- Modify: `tests/server/blogs/dto.test.ts`
- Modify: `tests/server/blogs/handler.test.ts`
- Modify: `lib/server/categories/dto.ts`
- Modify: `lib/server/categories/handler.ts`
- Modify: `lib/server/categories/service.ts`
- Modify: `lib/server/categories/repository.ts`
- Modify: `tests/server/categories/dto.test.ts`
- Modify: `tests/server/categories/handler.test.ts`
- Modify: `lib/server/tags/dto.ts`
- Modify: `lib/server/tags/handler.ts`
- Modify: `lib/server/tags/service.ts`
- Modify: `lib/server/tags/repository.ts`
- Modify: `tests/server/tags/dto.test.ts`
- Modify: `tests/server/tags/handler.test.ts`
- Modify: `lib/server/changelogs/dto.ts`
- Modify: `lib/server/changelogs/handler.ts`
- Modify: `lib/server/changelogs/service.ts`
- Modify: `lib/server/changelogs/repository.ts`
- Modify: `tests/server/changelogs/dto.test.ts`
- Modify: `tests/server/changelogs/handler.test.ts`

### Shared admin shell and resource infrastructure

- Create: `components/admin/admin-shell.tsx`
- Create: `components/admin/admin-sidebar.tsx`
- Create: `components/admin/admin-toolbar.tsx`
- Create: `components/admin/admin-navigation.ts`
- Create: `components/admin/admin-query-state.ts`
- Create: `components/admin/admin-resource-config.tsx`
- Create: `components/admin/admin-data-table.tsx`
- Create: `components/admin/admin-filter-bar.tsx`
- Create: `components/admin/admin-pagination.tsx`
- Create: `components/admin/admin-resource-drawer.tsx`
- Create: `components/admin/admin-resource-table-page.tsx`
- Create: `components/admin/resource-forms/blog-form.tsx`
- Create: `components/admin/resource-forms/category-form.tsx`
- Create: `components/admin/resource-forms/tag-form.tsx`
- Create: `components/admin/resource-forms/changelog-form.tsx`
- Modify: `components/admin/admin-types.ts`
- Modify: `components/admin/admin-data.ts`
- Modify: `styles/global.css`
- Modify: `app/admin/layout.tsx`

### Route pages and tests

- Modify: `app/admin/page.tsx`
- Modify: `app/admin/posts/page.tsx`
- Modify: `app/admin/categories/page.tsx`
- Modify: `app/admin/tags/page.tsx`
- Modify: `app/admin/changelog/page.tsx`
- Modify: `components/admin/admin-home.tsx`
- Modify: `components/admin/admin-home-view.tsx`
- Modify: `components/admin/admin-resource-page.tsx`
- Modify: `components/admin/admin-resource-view.tsx`
- Modify: `tests/app/admin-pages.test.tsx`
- Create: `tests/app/admin-query-state.test.ts`
- Create: `tests/app/admin-resource-config.test.tsx`

## Task 1: Expand server-side list queries for real search, filter, and sort

**Files:**

- Modify: `lib/server/blogs/dto.ts`
- Modify: `lib/server/blogs/handler.ts`
- Modify: `lib/server/blogs/service.ts`
- Modify: `lib/server/blogs/repository.ts`
- Modify: `tests/server/blogs/dto.test.ts`
- Modify: `tests/server/blogs/handler.test.ts`
- Modify: `lib/server/categories/dto.ts`
- Modify: `lib/server/categories/handler.ts`
- Modify: `lib/server/categories/service.ts`
- Modify: `lib/server/categories/repository.ts`
- Modify: `tests/server/categories/dto.test.ts`
- Modify: `tests/server/categories/handler.test.ts`
- Modify: `lib/server/tags/dto.ts`
- Modify: `lib/server/tags/handler.ts`
- Modify: `lib/server/tags/service.ts`
- Modify: `lib/server/tags/repository.ts`
- Modify: `tests/server/tags/dto.test.ts`
- Modify: `tests/server/tags/handler.test.ts`
- Modify: `lib/server/changelogs/dto.ts`
- Modify: `lib/server/changelogs/handler.ts`
- Modify: `lib/server/changelogs/service.ts`
- Modify: `lib/server/changelogs/repository.ts`
- Modify: `tests/server/changelogs/dto.test.ts`
- Modify: `tests/server/changelogs/handler.test.ts`

- [ ] **Step 1: Write failing list-query tests for one heavy and one light resource**

```ts
// tests/server/blogs/dto.test.ts
test("blogListQuerySchema parses keyword, sort, and direction", () => {
  const parsed = blogListQuerySchema.parse({
    page: "2",
    pageSize: "10",
    query: "admin",
    published: "true",
    featured: "false",
    categoryId: "cat_1",
    sortBy: "updatedAt",
    sortDirection: "asc",
  });

  assert.deepEqual(parsed, {
    page: 2,
    pageSize: 10,
    query: "admin",
    published: true,
    featured: false,
    categoryId: "cat_1",
    sortBy: "updatedAt",
    sortDirection: "asc",
  });
});

// tests/server/categories/handler.test.ts
test("handleListCategories forwards query and sort params to the service", async () => {
  let capturedQuery: unknown;
  const handlers = createCategoryHandlers({
    service: {
      async listCategories(query) {
        capturedQuery = query;
        return { items: [], total: 0 };
      },
      getCategory: async () => {
        throw new Error("unused");
      },
      createCategory: async () => {
        throw new Error("unused");
      },
      updateCategory: async () => {
        throw new Error("unused");
      },
      deleteCategory: async () => {
        throw new Error("unused");
      },
    },
  });

  await handlers.handleListCategories(
    new Request(
      "https://example.com/api/categories?page=1&pageSize=20&query=ux&sortBy=updatedAt&sortDirection=desc",
    ),
  );

  assert.deepEqual(capturedQuery, {
    page: 1,
    pageSize: 20,
    query: "ux",
    sortBy: "updatedAt",
    sortDirection: "desc",
  });
});
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `node --import tsx --test tests/server/blogs/dto.test.ts tests/server/categories/handler.test.ts`

Expected: FAIL because the current list query schemas and handlers do not accept `query`, `sortBy`, or `sortDirection`.

- [ ] **Step 3: Expand DTOs and handlers to parse the shared list-query shape**

```ts
// lib/server/categories/dto.ts
const categorySortBySchema = z.enum(["createdAt", "updatedAt", "name"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);

export const categoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: z.string().trim().min(1).optional(),
  sortBy: categorySortBySchema.default("updatedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});
```

```ts
// lib/server/categories/handler.ts
const query = categoryListQuerySchema.parse({
  page: url.searchParams.get("page") ?? undefined,
  pageSize: url.searchParams.get("pageSize") ?? undefined,
  query: url.searchParams.get("query") ?? undefined,
  sortBy: url.searchParams.get("sortBy") ?? undefined,
  sortDirection: url.searchParams.get("sortDirection") ?? undefined,
});
```

```ts
// lib/server/blogs/dto.ts
const blogSortBySchema = z.enum(["publishedAt", "updatedAt", "title"]);
const sortDirectionSchema = z.enum(["asc", "desc"]);

export const blogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  query: z.string().trim().min(1).optional(),
  published: optionalBoolean,
  featured: optionalBoolean,
  categoryId: nonEmptyString.optional(),
  sortBy: blogSortBySchema.default("publishedAt"),
  sortDirection: sortDirectionSchema.default("desc"),
});
```

- [ ] **Step 4: Update repositories and services to apply search and sort**

```ts
// lib/server/categories/repository.ts
const buildCategoryWhere = (query?: string) =>
  query
    ? or(
        ilike(categories.name, `%${query}%`),
        ilike(categories.slug, `%${query}%`),
      )
    : undefined;

const categoryOrderByMap = {
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
  name: categories.name,
} as const;
```

```ts
// lib/server/blogs/repository.ts
const buildFilters = ({
  query,
  published,
  featured,
  categoryId,
}: BlogListQuery) => {
  const filters: SQLWrapper[] = [];

  if (query) {
    filters.push(
      or(ilike(blogs.title, `%${query}%`), ilike(blogs.slug, `%${query}%`))!,
    );
  }

  if (published !== undefined) {
    filters.push(eq(blogs.published, published));
  }
  if (featured !== undefined) {
    filters.push(eq(blogs.featured, featured));
  }
  if (categoryId !== undefined) {
    filters.push(eq(blogs.categoryId, categoryId));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};
```

```ts
// lib/server/blogs/service.ts
listBlogs(query: BlogListQuery) {
  return repository.list(query);
}
```

- [ ] **Step 5: Run all list-query server tests**

Run: `node --import tsx --test tests/server/blogs/dto.test.ts tests/server/blogs/handler.test.ts tests/server/categories/dto.test.ts tests/server/categories/handler.test.ts tests/server/tags/dto.test.ts tests/server/tags/handler.test.ts tests/server/changelogs/dto.test.ts tests/server/changelogs/handler.test.ts`

Expected: PASS with all updated list-query tests green.

- [ ] **Step 6: Commit**

```bash
git add lib/server/blogs/dto.ts lib/server/blogs/handler.ts lib/server/blogs/service.ts lib/server/blogs/repository.ts tests/server/blogs/dto.test.ts tests/server/blogs/handler.test.ts lib/server/categories/dto.ts lib/server/categories/handler.ts lib/server/categories/service.ts lib/server/categories/repository.ts tests/server/categories/dto.test.ts tests/server/categories/handler.test.ts lib/server/tags/dto.ts lib/server/tags/handler.ts lib/server/tags/service.ts lib/server/tags/repository.ts tests/server/tags/dto.test.ts tests/server/tags/handler.test.ts lib/server/changelogs/dto.ts lib/server/changelogs/handler.ts lib/server/changelogs/service.ts lib/server/changelogs/repository.ts tests/server/changelogs/dto.test.ts tests/server/changelogs/handler.test.ts
git commit -m "feat(admin): 扩展资源列表查询能力"
```

## Task 2: Build the shared admin shell, navigation, and toolbar

**Files:**

- Create: `components/admin/admin-shell.tsx`
- Create: `components/admin/admin-sidebar.tsx`
- Create: `components/admin/admin-toolbar.tsx`
- Create: `components/admin/admin-navigation.ts`
- Modify: `app/admin/layout.tsx`
- Modify: `styles/global.css`
- Modify: `tests/app/admin-pages.test.tsx`

- [ ] **Step 1: Write a failing shell-render test**

```ts
test("AdminShell renders sidebar navigation and toolbar chrome", () => {
  const html = renderToStaticMarkup(
    <AdminShell
      title="Posts"
      description="Manage post records"
      pathname="/admin/posts"
    >
      <section>table</section>
    </AdminShell>,
  );

  assert.match(html, /Overview/);
  assert.match(html, /Posts/);
  assert.match(html, /Categories/);
  assert.match(html, /Search admin/);
  assert.match(html, /Manage post records/);
});
```

- [ ] **Step 2: Run the app test file to verify the new shell test fails**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx`

Expected: FAIL with module-not-found for `AdminShell`.

- [ ] **Step 3: Create navigation config and shell components**

```ts
// components/admin/admin-navigation.ts
export const adminNavigation = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts", label: "Posts" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/tags", label: "Tags" },
      { href: "/admin/changelog", label: "Changelog" },
    ],
  },
] as const;
```

```tsx
// components/admin/admin-shell.tsx
export function AdminShell({
  children,
  pathname,
  title,
  description,
}: {
  children: React.ReactNode;
  pathname: string;
  title: string;
  description: string;
}) {
  return (
    <div className="admin-shell">
      <AdminSidebar pathname={pathname} />
      <div className="admin-shell-main">
        <AdminToolbar title={title} description={description} />
        <div className="admin-shell-content">{children}</div>
      </div>
    </div>
  );
}
```

```tsx
// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
```

- [ ] **Step 4: Add admin-shell-specific utility classes without changing the site-wide visual language**

```css
@utility admin-shell {
  @apply min-h-[100dvh] bg-canvas text-text-strong md:grid md:grid-cols-[280px_minmax(0,1fr)];
}

@utility admin-sidebar {
  @apply border-r border-white/6 bg-surface-1/90 px-5 py-6 backdrop-blur-xl;
}

@utility admin-toolbar {
  @apply sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/6 bg-canvas/88 px-6 py-4 backdrop-blur-xl;
}
```

- [ ] **Step 5: Re-run the app render test**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx`

Expected: PASS with shell markup rendering and existing admin tests still green or updated for the new chrome.

- [ ] **Step 6: Commit**

```bash
git add components/admin/admin-shell.tsx components/admin/admin-sidebar.tsx components/admin/admin-toolbar.tsx components/admin/admin-navigation.ts app/admin/layout.tsx styles/global.css tests/app/admin-pages.test.tsx
git commit -m "feat(admin): 添加统一后台壳层"
```

## Task 3: Add query-state helpers and reusable resource table primitives

**Files:**

- Create: `components/admin/admin-query-state.ts`
- Create: `components/admin/admin-resource-config.tsx`
- Create: `components/admin/admin-data-table.tsx`
- Create: `components/admin/admin-filter-bar.tsx`
- Create: `components/admin/admin-pagination.tsx`
- Create: `components/admin/admin-resource-drawer.tsx`
- Create: `components/admin/admin-resource-table-page.tsx`
- Modify: `components/admin/admin-types.ts`
- Modify: `components/admin/admin-data.ts`
- Create: `tests/app/admin-query-state.test.ts`
- Create: `tests/app/admin-resource-config.test.tsx`

- [ ] **Step 1: Write failing tests for query parsing and resource config**

```ts
// tests/app/admin-query-state.test.ts
test("parseAdminListParams normalizes page, pageSize, and filters", () => {
  const params = new URLSearchParams(
    "page=2&pageSize=25&query=design&sortBy=updatedAt&sortDirection=asc",
  );

  assert.deepEqual(parseAdminListParams(params), {
    page: 2,
    pageSize: 25,
    query: "design",
    sortBy: "updatedAt",
    sortDirection: "asc",
  });
});

// tests/app/admin-resource-config.test.tsx
test("posts resource config exposes table columns and drawer copy", () => {
  const config = getAdminResourceConfig("blogs");
  assert.equal(config.title, "Posts");
  assert.equal(config.createLabel, "Add Post");
  assert.equal(config.columns[0]?.key, "title");
});
```

- [ ] **Step 2: Run the new focused tests to verify they fail**

Run: `node --import tsx --test tests/app/admin-query-state.test.ts tests/app/admin-resource-config.test.tsx`

Expected: FAIL because the helper and config modules do not exist yet.

- [ ] **Step 3: Create shared list-query helpers and resource config**

```ts
// components/admin/admin-query-state.ts
export type AdminListParams = {
  page: number;
  pageSize: number;
  query?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  published?: boolean;
  featured?: boolean;
  categoryId?: string;
};

export function parseAdminListParams(params: URLSearchParams): AdminListParams {
  return {
    page: Number(params.get("page") ?? "1"),
    pageSize: Number(params.get("pageSize") ?? "20"),
    query: params.get("query") ?? undefined,
    sortBy: params.get("sortBy") ?? undefined,
    sortDirection: params.get("sortDirection") === "asc" ? "asc" : "desc",
    published:
      params.get("published") === null
        ? undefined
        : params.get("published") === "true",
    featured:
      params.get("featured") === null
        ? undefined
        : params.get("featured") === "true",
    categoryId: params.get("categoryId") ?? undefined,
  };
}
```

```tsx
// components/admin/admin-resource-config.tsx
export function getAdminResourceConfig(resource: ResourceSection) {
  if (resource === "blogs") {
    return {
      title: "Posts",
      createLabel: "Add Post",
      columns: [
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status" },
        { key: "featured", label: "Featured" },
        { key: "publishedAt", label: "Published At" },
        { key: "updatedAt", label: "Updated At" },
      ],
    };
  }

  return {
    title: "Categories",
    createLabel: "Add Category",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "updatedAt", label: "Updated At" },
    ],
  };
}
```

- [ ] **Step 4: Add table, filter bar, pagination, drawer, and data helpers**

```tsx
// components/admin/admin-data-table.tsx
export function AdminDataTable<TItem>({
  columns,
  items,
  onRowClick,
}: {
  columns: Array<{ key: string; label: string }>;
  items: TItem[];
  onRowClick: (item: TItem) => void;
}) {
  return (
    <div className="admin-table-shell">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} onClick={() => onRowClick(item)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```ts
// components/admin/admin-data.ts
export async function fetchAdminResourceList<T>(
  path: string,
  params: URLSearchParams,
) {
  const response = await fetch(`${path}?${params.toString()}`, {
    cache: "no-store",
  });

  return parseResponse<{ items: T[]; meta?: never }>(response);
}
```

- [ ] **Step 5: Re-run the helper tests**

Run: `node --import tsx --test tests/app/admin-query-state.test.ts tests/app/admin-resource-config.test.tsx`

Expected: PASS with both helper modules covered and stable.

- [ ] **Step 6: Commit**

```bash
git add components/admin/admin-query-state.ts components/admin/admin-resource-config.tsx components/admin/admin-data-table.tsx components/admin/admin-filter-bar.tsx components/admin/admin-pagination.tsx components/admin/admin-resource-drawer.tsx components/admin/admin-resource-table-page.tsx components/admin/admin-types.ts components/admin/admin-data.ts tests/app/admin-query-state.test.ts tests/app/admin-resource-config.test.tsx
git commit -m "feat(admin): 添加资源表格基础设施"
```

## Task 4: Migrate the dashboard and posts page to the new shell and drawer workflow

**Files:**

- Modify: `app/admin/page.tsx`
- Modify: `app/admin/posts/page.tsx`
- Modify: `components/admin/admin-home.tsx`
- Modify: `components/admin/admin-home-view.tsx`
- Modify: `components/admin/admin-resource-page.tsx`
- Modify: `components/admin/admin-resource-view.tsx`
- Create: `components/admin/resource-forms/blog-form.tsx`
- Modify: `tests/app/admin-pages.test.tsx`

- [ ] **Step 1: Write failing render tests for the dashboard and posts table view**

```ts
test("AdminHomeView renders admin dashboard cards instead of navigation-only tiles", () => {
  const html = renderToStaticMarkup(<AdminHomeView data={sampleData} />);
  assert.match(html, /Dashboard/);
  assert.match(html, /Posts/);
  assert.match(html, /Categories/);
  assert.match(html, /Quick access/);
});

test("Posts resource page renders table headers and drawer trigger copy", () => {
  const html = renderToStaticMarkup(
    <AdminResourceTablePage
      resource="blogs"
      pathname="/admin/posts"
      searchParams={new URLSearchParams("page=1&pageSize=10")}
    />,
  );

  assert.match(html, /Title/);
  assert.match(html, /Status/);
  assert.match(html, /Add Post/);
});
```

- [ ] **Step 2: Run the app test file to verify the new posts/dashboard expectations fail**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx`

Expected: FAIL because the dashboard and posts page still render the old navigation-card and split-editor layout.

- [ ] **Step 3: Convert `/admin` into a shell-backed dashboard**

```tsx
// app/admin/page.tsx
export default function AdminPage() {
  return <AdminHome />;
}

// components/admin/admin-home-view.tsx
export function AdminHomeView({ data }: { data: AdminDashboardData }) {
  return (
    <AdminShell
      pathname="/admin"
      title="Dashboard"
      description="Monitor content resources and jump into management views."
    >
      <main className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* count cards */}
        </section>
        <section className="admin-dashboard-links">{/* quick links */}</section>
      </main>
    </AdminShell>
  );
}
```

- [ ] **Step 4: Replace the posts page with the reusable resource table page and blog drawer form**

```tsx
// app/admin/posts/page.tsx
export default function AdminPostsPage() {
  return (
    <AdminResourceTablePage
      resource="blogs"
      pathname="/admin/posts"
      apiBasePath="/api/blogs"
    />
  );
}
```

```tsx
// components/admin/resource-forms/blog-form.tsx
export function BlogForm({
  draft,
  categories,
  tags,
  onDraftChange,
  onToggleBlogTag,
}: BlogFormProps) {
  return (
    <>
      <label className="grid gap-2">
        <span>Title</span>
        <input
          name="title"
          value={draft.title}
          onChange={(event) => onDraftChange("title", event.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span>Slug</span>
        <input
          name="slug"
          value={draft.slug}
          onChange={(event) => onDraftChange("slug", event.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span>Content</span>
        <textarea
          name="content"
          value={draft.content}
          onChange={(event) => onDraftChange("content", event.target.value)}
        />
      </label>
    </>
  );
}
```

- [ ] **Step 5: Re-run the app test file and verify the textarea constraint**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx`

Expected: PASS with dashboard shell markup, posts table copy, and `name="content"` still rendered as a plain `<textarea>`.

- [ ] **Step 6: Commit**

```bash
git add app/admin/page.tsx app/admin/posts/page.tsx components/admin/admin-home.tsx components/admin/admin-home-view.tsx components/admin/admin-resource-page.tsx components/admin/admin-resource-view.tsx components/admin/resource-forms/blog-form.tsx tests/app/admin-pages.test.tsx
git commit -m "feat(admin): 重构首页和文章管理页"
```

## Task 5: Migrate categories, tags, and changelog pages to the shared resource template

**Files:**

- Modify: `app/admin/categories/page.tsx`
- Modify: `app/admin/tags/page.tsx`
- Modify: `app/admin/changelog/page.tsx`
- Create: `components/admin/resource-forms/category-form.tsx`
- Create: `components/admin/resource-forms/tag-form.tsx`
- Create: `components/admin/resource-forms/changelog-form.tsx`
- Modify: `components/admin/admin-resource-config.tsx`
- Modify: `tests/app/admin-pages.test.tsx`

- [ ] **Step 1: Extend the app render tests to cover the lighter resource pages**

```ts
test("Changelog resource view keeps plain textarea editing inside the drawer form", () => {
  const config = getAdminResourceConfig("changelogs");
  assert.equal(config.title, "Changelog");

  const html = renderToStaticMarkup(
    <ChangelogForm
      draft={{ version: "v1.0.0", content: "Initial release", releaseDate: "2026-04-19" }}
      onDraftChange={() => {}}
    />,
  );

  assert.match(html, /<textarea[^>]*name="content"/);
});
```

- [ ] **Step 2: Run app tests to verify the new form/config checks fail**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx tests/app/admin-resource-config.test.tsx`

Expected: FAIL because the resource configs and form modules for categories, tags, and changelogs are not complete yet.

- [ ] **Step 3: Add the remaining resource forms and config branches**

```tsx
// components/admin/resource-forms/changelog-form.tsx
export function ChangelogForm({ draft, onDraftChange }: ChangelogFormProps) {
  return (
    <>
      <label className="grid gap-2">
        <span>Version</span>
        <input
          name="version"
          value={draft.version}
          onChange={(event) => onDraftChange("version", event.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span>Release Date</span>
        <input
          type="date"
          name="releaseDate"
          value={draft.releaseDate}
          onChange={(event) => onDraftChange("releaseDate", event.target.value)}
        />
      </label>
      <label className="grid gap-2">
        <span>Content</span>
        <textarea
          name="content"
          value={draft.content}
          onChange={(event) => onDraftChange("content", event.target.value)}
        />
      </label>
    </>
  );
}
```

```tsx
// components/admin/admin-resource-config.tsx
if (resource === "tags") {
  return {
    title: "Tags",
    createLabel: "Add Tag",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "description", label: "Description" },
      { key: "updatedAt", label: "Updated At" },
    ],
  };
}
```

- [ ] **Step 4: Point the three remaining routes at the shared resource table page**

```tsx
// app/admin/categories/page.tsx
export default function AdminCategoriesPage() {
  return (
    <AdminResourceTablePage
      resource="categories"
      pathname="/admin/categories"
      apiBasePath="/api/categories"
    />
  );
}
```

```tsx
// app/admin/changelog/page.tsx
export default function AdminChangelogPage() {
  return (
    <AdminResourceTablePage
      resource="changelogs"
      pathname="/admin/changelog"
      apiBasePath="/api/changelogs"
    />
  );
}
```

- [ ] **Step 5: Run the app render tests again**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx tests/app/admin-resource-config.test.tsx`

Expected: PASS with all four resource pages mapped to the shared admin table workflow and changelog still using a plain `textarea`.

- [ ] **Step 6: Commit**

```bash
git add app/admin/categories/page.tsx app/admin/tags/page.tsx app/admin/changelog/page.tsx components/admin/resource-forms/category-form.tsx components/admin/resource-forms/tag-form.tsx components/admin/resource-forms/changelog-form.tsx components/admin/admin-resource-config.tsx tests/app/admin-pages.test.tsx tests/app/admin-resource-config.test.tsx
git commit -m "feat(admin): 统一剩余资源管理页"
```

## Task 6: Verify the full admin flow and clean out obsolete split-layout code

**Files:**

- Modify: `components/admin/admin-layout-shell.tsx`
- Modify: `components/admin/admin-home.tsx`
- Modify: `components/admin/admin-resource-page.tsx`
- Modify: `components/admin/admin-resource-view.tsx`
- Modify: `tests/app/admin-pages.test.tsx`

- [ ] **Step 1: Remove dead split-layout code paths after the new shell is live**

```tsx
// components/admin/admin-layout-shell.tsx
// Delete this file once every admin route renders AdminShell directly.

// components/admin/admin-resource-view.tsx
// Delete this file after moving its field helpers into resource-forms/*.
```

- [ ] **Step 2: Run the complete admin-related test suite**

Run: `node --import tsx --test tests/app/admin-pages.test.tsx tests/app/admin-query-state.test.ts tests/app/admin-resource-config.test.tsx tests/server/blogs/dto.test.ts tests/server/blogs/handler.test.ts tests/server/categories/dto.test.ts tests/server/categories/handler.test.ts tests/server/tags/dto.test.ts tests/server/tags/handler.test.ts tests/server/changelogs/dto.test.ts tests/server/changelogs/handler.test.ts`

Expected: PASS with all admin app tests and list-query server tests green.

- [ ] **Step 3: Run repository-wide quality checks that cover the touched surface**

Run: `pnpm lint`

Expected: PASS with no new oxlint errors.

Run: `pnpm format:check`

Expected: PASS with no formatting drift.

- [ ] **Step 4: Commit the cleanup and verification pass**

```bash
git add components/admin/admin-layout-shell.tsx components/admin/admin-home.tsx components/admin/admin-resource-page.tsx components/admin/admin-resource-view.tsx tests/app/admin-pages.test.tsx
git commit -m "refactor(admin): 清理旧版后台布局实现"
```

## Self-Review

### Spec coverage

- Shared sidebar and toolbar shell: covered by Task 2.
- Dashboard conversion: covered by Task 4.
- Table-first resource pages: covered by Tasks 3, 4, and 5.
- Functional search, filter, sort, and pagination: covered by Task 1 plus Task 3.
- Drawer-based editing: covered by Tasks 3, 4, and 5.
- Plain `textarea` instead of rich text: covered explicitly in Tasks 4 and 5 tests and form snippets.
- Final verification: covered by Task 6.

### Placeholder scan

- No `TODO`, `TBD`, or "implement later" markers remain.
- Commands are concrete and use the repository's existing `node --import tsx --test`, `pnpm lint`, and `pnpm format:check` flows.
- File paths are explicit for each task.

### Type consistency

- Resource names consistently use existing `ResourceSection` values: `blogs`, `categories`, `tags`, `changelogs`.
- Query helpers consistently use `page`, `pageSize`, `query`, `sortBy`, and `sortDirection`.
- Long-text editing consistently stays on `textarea`-backed form fields.
