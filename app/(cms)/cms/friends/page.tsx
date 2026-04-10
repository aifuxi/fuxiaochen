import { CmsFriendLinkManager } from "@/components/blocks/cms-friend-link-manager";
import { CmsShell } from "@/components/layout/cms-shell";

export default function CmsFriendsPage() {
  return (
    <CmsShell
      description="Manage directory entries, friend site metadata, and visibility states against the live API."
      title="Friends"
    >
      <CmsFriendLinkManager />
    </CmsShell>
  );
}
