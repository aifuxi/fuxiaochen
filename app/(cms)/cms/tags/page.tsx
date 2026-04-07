import { ResourceTable } from "@/components/blocks/resource-table";
import { CmsShell } from "@/components/layout/cms-shell";
import { taxonomyRows } from "@/lib/mocks/cms-content";

export default function CmsTagsPage() {
  return (
    <CmsShell description="Tags share the same management mechanics as categories in the first pass." title="Tags">
      <ResourceTable
        columns={[
          { key: "label", label: "Tag" },
          { key: "usage", label: "Usage" },
          { key: "tone", label: "Tone" },
        ]}
        rows={taxonomyRows}
      />
    </CmsShell>
  );
}
