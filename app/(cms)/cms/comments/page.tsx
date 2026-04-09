import { CmsCommentManager } from "@/components/blocks/cms-comment-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsCommentsPage() {
  return (
    <CmsShell description="Review, approve, or remove community discussion with clear moderation states." title="Comments">
      <CmsCommentManager />
    </CmsShell>
  );
}
