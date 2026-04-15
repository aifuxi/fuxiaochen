import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CmsEditorLayout } from "@/components/cms/cms-editor-layout";

describe("CmsEditorLayout", () => {
  test("renders primary and sidebar with the shared two-column grid", () => {
    const markup = renderToStaticMarkup(
      <CmsEditorLayout
        primary={<div>Primary content</div>}
        sidebar={<div>Sidebar content</div>}
      />,
    );

    expect(markup).toContain("Primary content");
    expect(markup).toContain("Sidebar content");
    expect(markup).toContain("xl:grid-cols-[1fr_360px]");
  });
});
