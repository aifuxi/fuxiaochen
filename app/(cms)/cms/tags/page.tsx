import { CmsTagManager } from "@/components/blocks/cms-tag-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsTagsPage() {
  return (
    <CmsShell description="统一管理可复用标签、文章关联和编辑分类法。" title="标签">
      <CmsTagManager />
    </CmsShell>
  );
}
