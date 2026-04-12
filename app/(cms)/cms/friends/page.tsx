import { CmsFriendLinkManager } from "@/components/blocks/cms-friend-link-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsFriendsPage() {
  return (
    <CmsShell
      description="管理友链目录条目、友站元数据和可见性状态。"
      title="友链"
    >
      <CmsFriendLinkManager />
    </CmsShell>
  );
}
