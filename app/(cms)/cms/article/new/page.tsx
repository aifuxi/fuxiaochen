import { ArticleEditorShell } from "@/components/blocks/article-editor-shell";
import { CmsShell } from "@/components/layout/cms-shell";
import { articles } from "@/lib/mocks/site-content";

export default function CmsNewArticlePage() {
  return (
    <CmsShell description="A ByteMD-based authoring surface wrapped in the same component system as the rest of the CMS." title="Create Article">
      <ArticleEditorShell initialValue={articles[0].markdown} />
    </CmsShell>
  );
}
