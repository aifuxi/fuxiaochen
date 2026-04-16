import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/cms/dashboard",
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
  },
}));

import { CmsSidebar } from "@/components/layout/cms-sidebar";

describe("CmsSidebar", () => {
  test("renders the sign-out action in the sidebar footer", () => {
    const html = renderToStaticMarkup(
      <CmsSidebar
        user={{
          email: "chen@example.com",
          name: "Chen Blog",
        }}
      />,
    );

    expect(html).toContain("退出登录");
    expect(html).toContain("sticky");
    expect(html).toContain("top-0");
    expect(html).toContain("h-dvh");
  });
});
