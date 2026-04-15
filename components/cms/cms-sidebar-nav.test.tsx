import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CmsSidebarNav } from "@/components/cms/cms-sidebar-nav";
import { cmsNavGroups } from "@/lib/mocks/cms-content";

describe("CmsSidebarNav", () => {
  test("marks the active item with data-current and avoids bg-primary/10", () => {
    const html = renderToStaticMarkup(
      <CmsSidebarNav currentPath="/cms/dashboard" groups={cmsNavGroups} />,
    );

    expect(html).toContain('data-current="true"');
    expect(html).not.toContain("bg-primary/10");
  });

  test("keeps the parent item active for CMS detail routes", () => {
    const html = renderToStaticMarkup(
      <CmsSidebarNav currentPath="/cms/articles/123" groups={cmsNavGroups} />,
    );

    expect(html).toContain('data-current="true"');
  });
});
