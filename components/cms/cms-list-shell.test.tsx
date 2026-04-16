import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CmsListShell } from "@/components/cms/cms-list-shell";

describe("CmsListShell", () => {
  test("renders filters and body in a fixed order", () => {
    const markup = renderToStaticMarkup(
      <CmsListShell
        body={<section data-slot="body">Body content</section>}
        filters={<header data-slot="filters">Filter controls</header>}
      />,
    );

    expect(markup).toContain("Filter controls");
    expect(markup).toContain("Body content");
    expect(markup.indexOf("Filter controls")).toBeLessThan(
      markup.indexOf("Body content"),
    );
  });
});
