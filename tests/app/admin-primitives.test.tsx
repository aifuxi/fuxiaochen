import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import assert from "node:assert/strict";
import test from "node:test";

import { AdminDataTable } from "../../components/admin/admin-data-table";
import { getAdminResourceConfig } from "../../components/admin/admin-resource-config";
import { AdminResourceDrawer } from "../../components/admin/admin-resource-drawer";
import { AdminResourceTablePage } from "../../components/admin/admin-resource-table-page";

function findElement(
  node: ReactNode,
  predicate: (element: ReactElement) => boolean,
): ReactElement | null {
  if (Array.isArray(node)) {
    for (const child of node as ReactNode[]) {
      const match = findElement(child, predicate);

      if (match) {
        return match;
      }
    }

    return null;
  }

  if (!isValidElement(node)) {
    return null;
  }

  const element = node as ReactElement<{ children?: ReactNode }>;

  if (predicate(element)) {
    return element;
  }

  return findElement(element.props.children, predicate);
}

test("AdminDataTable renders boolean cells explicitly and exposes keyboard row activation", () => {
  const html = renderToStaticMarkup(
    <AdminDataTable
      columns={[
        { key: "title", label: "Title" },
        { key: "published", label: "Published" },
      ]}
      items={[
        {
          id: "post_1",
          title: "Admin shell",
          published: true,
        },
      ]}
      onRowClick={() => {}}
    />,
  );

  assert.match(html, />True</);
  assert.match(html, /tabindex="0"/);

  let activationCount = 0;
  const tree = AdminDataTable({
    columns: [
      { key: "title", label: "Title" },
      { key: "published", label: "Published" },
    ],
    items: [
      {
        id: "post_1",
        title: "Admin shell",
        published: true,
      },
    ],
    onRowClick: () => {
      activationCount += 1;
    },
  });

  const interactiveRow = findElement(
    tree,
    (element) =>
      element.type === "tr" &&
      typeof element.props.onKeyDown === "function" &&
      element.props.tabIndex === 0,
  );

  assert.ok(interactiveRow);

  interactiveRow.props.onKeyDown({
    key: "Enter",
    preventDefault() {},
  });
  interactiveRow.props.onKeyDown({
    key: " ",
    preventDefault() {},
  });

  assert.equal(activationCount, 2);
});

test("AdminResourceTablePage renders declared filter controls generically", () => {
  const html = renderToStaticMarkup(
    <AdminResourceTablePage
      drawerOpen={false}
      filterOptions={{
        categoryId: [
          { label: "All categories", value: "" },
          { label: "Design", value: "cat_1" },
        ],
      }}
      filterValues={{
        query: "design",
        published: true,
        featured: false,
        categoryId: "cat_1",
      }}
      items={[
        {
          id: "post_1",
          title: "Admin shell",
          slug: "admin-shell",
          category: "Design",
          status: "Published",
          featured: true,
          publishedAt: "2026-04-19",
          updatedAt: "2026-04-19",
        },
      ]}
      page={1}
      pageSize={20}
      resource="blogs"
      total={1}
      onFilterChange={() => {}}
    />,
  );

  assert.match(html, /Search posts by title or slug/);
  assert.match(html, /name="published"/);
  assert.match(html, /name="featured"/);
  assert.match(html, /name="categoryId"/);
  assert.match(html, />Design</);
});

test("AdminResourceDrawer exposes dialog semantics and Escape dismissal", () => {
  let closeCount = 0;
  const tree = AdminResourceDrawer({
    open: true,
    title: "Edit post",
    description: "Update metadata.",
    children: <div>Drawer body</div>,
    footer: <div>Drawer footer</div>,
    onClose: () => {
      closeCount += 1;
    },
  });

  const dialog = findElement(
    tree,
    (element) => element.props.role === "dialog",
  );

  assert.ok(dialog);
  assert.equal(dialog.props["aria-modal"], true);
  assert.ok(dialog.props["aria-labelledby"]);
  assert.ok(dialog.props["aria-describedby"]);

  dialog.props.onKeyDown({
    key: "Escape",
    preventDefault() {},
  });

  assert.equal(closeCount, 1);

  const closeButton = findElement(
    tree,
    (element) =>
      element.type === "button" &&
      typeof element.props.onClick === "function" &&
      element.props.autoFocus === true,
  );

  assert.ok(closeButton);
});

test("resource configs expose typed filters for reusable table pages", () => {
  const config = getAdminResourceConfig("blogs");

  assert.deepEqual(
    config.filters.map((filter) => [filter.key, filter.kind]),
    [
      ["query", "search"],
      ["published", "boolean"],
      ["categoryId", "select"],
      ["featured", "boolean"],
    ],
  );
});
