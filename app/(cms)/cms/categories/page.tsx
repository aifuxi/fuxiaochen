import { CmsCategoryManager } from "@/components/blocks/cms-category-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsCategoriesPage() {
  return (
    <CmsShell description="Organize article collections with colors, counts, and quick taxonomy maintenance." title="Categories">
      <CmsCategoryManager />
    </CmsShell>
  );
}
