import { CmsCommentManager } from "@/components/blocks/cms-comment-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsCommentsPage() {
  return (
    <CmsShell description="审核、批准或删除社区讨论，拥有清晰的审核状态。" title="评论">
      <CmsCommentManager />
    </CmsShell>
  );
}
