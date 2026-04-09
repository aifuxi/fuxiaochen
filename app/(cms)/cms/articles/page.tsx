import { CmsArticleManager } from "@/components/blocks/cms-article-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsArticlesPage() {
  return (
    <CmsShell description="Manage article state, status, taxonomy, and revisions against the live content API." title="Articles">
      <CmsArticleManager />
    </CmsShell>
  );
}
