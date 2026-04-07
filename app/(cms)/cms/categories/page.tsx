import { ResourceTable } from "@/components/blocks/resource-table";
import { CmsShell } from "@/components/layout/cms-shell";
import { taxonomyRows } from "@/lib/mocks/cms-content";

export default function CmsCategoriesPage() {
  return (
    <CmsShell description="Taxonomy surfaces use the same table patterns as articles and moderation queues." title="Categories">
      <ResourceTable
        columns={[
          { key: "label", label: "Category" },
          { key: "usage", label: "Usage" },
          { key: "tone", label: "Tone" },
        ]}
        rows={taxonomyRows}
      />
    </CmsShell>
  );
}
