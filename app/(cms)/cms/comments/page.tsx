import { ResourceTable } from "@/components/blocks/resource-table";
import { CmsShell } from "@/components/layout/cms-shell";
import { commentRows } from "@/lib/mocks/cms-content";

export default function CmsCommentsPage() {
  return (
    <CmsShell description="Moderation queues demonstrate data states, badges, and table presentation." title="Comments">
      <ResourceTable
        columns={[
          { key: "author", label: "Author" },
          { key: "article", label: "Article" },
          { key: "status", label: "Status" },
          { key: "content", label: "Comment" },
        ]}
        rows={commentRows}
      />
    </CmsShell>
  );
}
