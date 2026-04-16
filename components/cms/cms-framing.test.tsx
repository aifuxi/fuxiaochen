import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import * as dashboardPanels from "@/components/cms/cms-dashboard-panels";
import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsMetricStrip } from "@/components/cms/cms-metric-strip";
import { CmsPageHeader } from "@/components/cms/cms-page-header";

describe("CMS framing primitives", () => {
  test("does not re-export CmsSectionPanel from dashboard panels", () => {
    expect("CmsSectionPanel" in dashboardPanels).toBe(false);
  });

  test("render the shared framing surfaces without glass-card", () => {
    const markup = [
      renderToStaticMarkup(
        <CmsPageHeader
          description="Shared chrome for CMS pages."
          eyebrow="CMS"
          actions={<button type="button">新建</button>}
          meta={<span>meta</span>}
          title="Content"
        />,
      ),
      renderToStaticMarkup(
        <CmsMetricStrip
          items={[
            { label: "总数", value: "12" },
            { label: "已发布", value: "8" },
          ]}
        />,
      ),
      renderToStaticMarkup(
        <CmsEmptyState
          description="Nothing here yet."
          title="暂无内容"
        />,
      ),
    ].join("\n");

    expect(markup).toContain("Content");
    expect(markup).toContain("CMS");
    expect(markup).toContain("meta");
    expect(markup).toContain("新建");
    expect(markup).toContain("总数");
    expect(markup).toContain("暂无内容");
    expect(markup).toContain("Nothing here yet.");
    expect(markup).not.toContain("glass-card");
  });
});
