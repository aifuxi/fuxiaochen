import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  CmsActivityList,
  CmsSummaryGrid,
} from "@/components/cms/cms-dashboard-panels";

describe("CMS dashboard panels", () => {
  test("render summary and activity panels without glass-card", () => {
    const markup = renderToStaticMarkup(
      <div>
        <CmsSummaryGrid
          items={[
            {
              description: "+12%",
              label: "总浏览量",
              value: "128K",
            },
            {
              description: "-3%",
              label: "已发布文章",
              value: "42",
            },
          ]}
        />
        <CmsActivityList
          items={[
            {
              id: "activity-1",
              message: "发布了《重构进度说明》",
              occurredAt: "2026-04-16T08:00:00.000Z",
              type: "article",
            },
            {
              id: "activity-2",
              message: "收到了新的评论",
              occurredAt: "2026-04-16T09:00:00.000Z",
              type: "comment",
            },
          ]}
        />
      </div>,
    );

    expect(markup).toContain("总浏览量");
    expect(markup).toContain("发布了《重构进度说明》");
    expect(markup).not.toContain("glass-card");
  });
});
