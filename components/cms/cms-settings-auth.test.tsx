import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CmsAuthFrame } from "@/components/cms/cms-auth-frame";
import { CmsSettingsNav } from "@/components/cms/cms-settings-nav";

describe("CMS settings and auth framing", () => {
  test("CmsSettingsNav renders the provided sections", () => {
    const markup = renderToStaticMarkup(
      <CmsSettingsNav
        activeSection="常规"
        sections={["常规", "外观", "SEO"]}
      />,
    );

    expect(markup).toContain("<ol");
    expect(markup).toContain('data-section="常规"');
    expect(markup).toContain('data-section="外观"');
    expect(markup).toContain('data-section="SEO"');
    expect(markup).toContain('aria-label="设置章节：常规"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("btn-primary-glow");
    expect(markup).not.toContain("bg-primary/10");
  });

  test("CmsAuthFrame renders title and description without glass effects", () => {
    const markup = renderToStaticMarkup(
      <CmsAuthFrame
        description="创建账户以开始发布内容。"
        title="注册"
      >
        <div>Form</div>
      </CmsAuthFrame>,
    );

    expect(markup).toContain("注册");
    expect(markup).toContain("创建账户以开始发布内容。");
    expect(markup).toContain("Form");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("btn-primary-glow");
  });
});
