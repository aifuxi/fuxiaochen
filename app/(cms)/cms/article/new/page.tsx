import { CmsArticleForm } from "@/components/blocks/cms-article-form";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsNewArticlePage() {
  return (
    <CmsShell description="Write and publish articles against the live content API with taxonomy, status, and SEO metadata." title="Create Article">
      <CmsArticleForm />
    </CmsShell>
  );
}
