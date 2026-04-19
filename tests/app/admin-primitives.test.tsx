import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import assert from "node:assert/strict";
import test from "node:test";

import { AdminDataTable } from "../../components/admin/admin-data-table";
import { getAdminResourceConfig } from "../../components/admin/admin-resource-config";
import {
  AdminResourceDrawer,
  createAdminDrawerLifecycle,
  handleAdminDrawerKeyDown,
} from "../../components/admin/admin-resource-drawer";
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
  const html = renderToStaticMarkup(
    <AdminResourceDrawer
      description="Update metadata."
      footer={<div>Drawer footer</div>}
      open={true}
      title="Edit post"
      onClose={() => {}}
    >
      <div>Drawer body</div>
    </AdminResourceDrawer>,
  );

  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-labelledby=/);
  assert.match(html, /aria-describedby=/);
  assert.match(html, />Close</);
});

test("AdminResourceDrawer lifecycle manages focus, scroll lock, and focus restoration", () => {
  let bodyOverflow = "auto";
  const previouslyFocused = {
    focusCalls: 0,
    focus() {
      this.focusCalls += 1;
    },
  };
  const initialTarget = {
    focusCalls: 0,
    focus() {
      this.focusCalls += 1;
    },
  };
  const ownerDocument = {
    activeElement: previouslyFocused,
    body: {
      style: {
        get overflow() {
          return bodyOverflow;
        },
        set overflow(value: string) {
          bodyOverflow = value;
        },
      },
    },
  };
  const container = {
    ownerDocument,
    contains(target: unknown) {
      return target === initialTarget;
    },
    querySelectorAll() {
      return [initialTarget];
    },
  };

  const cleanup = createAdminDrawerLifecycle({
    container: container as never,
  });

  cleanup();

  assert.equal(bodyOverflow, "auto");
  assert.equal(initialTarget.focusCalls, 1);
  assert.equal(previouslyFocused.focusCalls, 1);
});

test("AdminResourceDrawer keyboard handler traps focus and closes on Escape", () => {
  let closeCount = 0;
  const first = {
    focusCalls: 0,
    focus() {
      this.focusCalls += 1;
    },
  };
  const last = {
    focusCalls: 0,
    focus() {
      this.focusCalls += 1;
    },
  };
  const container = {
    contains(target: unknown) {
      return target === first || target === last;
    },
    querySelectorAll() {
      return [first, last];
    },
  };

  let prevented = 0;
  handleAdminDrawerKeyDown(
    {
      key: "Tab",
      shiftKey: true,
      target: first,
      preventDefault() {
        prevented += 1;
      },
    } as never,
    {
      container: container as never,
      onClose: () => {
        closeCount += 1;
      },
    },
  );

  handleAdminDrawerKeyDown(
    {
      key: "Tab",
      shiftKey: false,
      target: last,
      preventDefault() {
        prevented += 1;
      },
    } as never,
    {
      container: container as never,
      onClose: () => {
        closeCount += 1;
      },
    },
  );

  handleAdminDrawerKeyDown(
    {
      key: "Escape",
      shiftKey: false,
      target: first,
      preventDefault() {
        prevented += 1;
      },
    } as never,
    {
      container: container as never,
      onClose: () => {
        closeCount += 1;
      },
    },
  );

  assert.equal(prevented, 3);
  assert.equal(first.focusCalls, 1);
  assert.equal(last.focusCalls, 1);
  assert.equal(closeCount, 1);
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
