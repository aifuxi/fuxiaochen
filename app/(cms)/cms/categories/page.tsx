import { CmsCategoryManager } from "@/components/blocks/cms-category-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsCategoriesPage() {
  return (
    <CmsShell description="使用颜色、数量快速组织和维护文章分类。" title="分类">
      <CmsCategoryManager />
    </CmsShell>
  );
}
