import { CmsArticleManager } from "@/components/blocks/cms-article-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsArticlesPage() {
  return (
    <CmsShell description="管理文章状态、状态、分类和版本，对抗实时内容 API。" title="文章">
      <CmsArticleManager />
    </CmsShell>
  );
}
