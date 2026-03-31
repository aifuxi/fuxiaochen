import { CmsShell } from "@/components/layouts/cms-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CmsCommentsPage() {
  return (
    <CmsShell
      currentPath="/cms/comments"
      description="Moderation surfaces belong in the CMS domain and should not reuse public page composition."
      title="Comments"
    >
      <Card>
        <CardContent className="p-0 text-sm leading-7 text-muted">
          This placeholder marks where moderation queues, filters and status
          badges will be extracted into reusable CMS components.
        </CardContent>
      </Card>
    </CmsShell>
  );
}
