import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireCmsSession: async () => ({
    user: {
      email: "chen@example.com",
      name: "Chen Blog",
    },
  }),
}));

vi.mock("@/components/layout/cms-sidebar", () => ({
  CmsSidebar: () => <aside>Sidebar</aside>,
}));

vi.mock("@/components/cms/cms-page-header", () => ({
  CmsPageHeader: ({
    className,
    description,
    title,
  }: {
    className?: string;
    description: string;
    title: string;
  }) => (
    <div className={className}>
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}));

import { CmsShell } from "@/components/layout/cms-shell";

describe("CmsShell", () => {
  test("keeps the viewport locked and makes only the main content area scroll", async () => {
    const markup = renderToStaticMarkup(
      await CmsShell({
        children: <div>Body content</div>,
        description: "CMS description",
        title: "CMS title",
      }),
    );

    expect(markup).toContain("h-dvh");
    expect(markup).toContain("overflow-hidden");
    expect(markup).toContain("min-h-0");
    expect(markup).toContain("overflow-y-auto");
    expect(markup).toContain("overscroll-contain");
    expect(markup).toContain("Body content");
  });
});
