import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsMetricStrip } from "@/components/cms/cms-metric-strip";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";

describe("CMS framing primitives", () => {
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
        <CmsSectionPanel
          description="Section content"
          title="Section title"
        >
          <div>Body</div>
        </CmsSectionPanel>,
      ),
      renderToStaticMarkup(
        <CmsSectionPanel>
          <div>Plain body</div>
        </CmsSectionPanel>,
      ),
      renderToStaticMarkup(
        <CmsSectionPanel description="Description only">
          <div>Plain body</div>
        </CmsSectionPanel>,
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
    expect(markup).toContain("scroll-mt-28");
    expect(markup).toContain("总数");
    expect(markup).toContain("Body");
    expect(markup).toContain("Plain body");
    expect(markup).toContain("Description only");
    expect(markup).toContain("暂无内容");
    expect(markup).toContain("Nothing here yet.");
    expect(markup).not.toContain("glass-card");
  });
});
