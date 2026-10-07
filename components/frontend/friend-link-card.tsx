import { ExternalLink } from "lucide-react";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import { CardLink } from "@/components/ui/card";

type FriendCardData = {
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: string;
};

function displayFriendUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url;
  }
}

export function FriendLinkCard({ friend }: { friend: FriendCardData }) {
  return (
    <CardLink href={friend.url} target="_blank" rel="noopener noreferrer">
      <span className="site-friend-icon" aria-hidden="true">
        <ConfiguredImage src={friend.avatar} size={32} fallback="link" />
      </span>
      <div className="site-friend-content">
        <h2 className="ds-title">{friend.name}</h2>
        {friend.description && <p className="ds-body">{friend.description}</p>}
        <div className="site-friend-meta">
          <span className="site-friend-url" title={friend.url}>
            <ExternalLink size={16} aria-hidden="true" />
            <span>{displayFriendUrl(friend.url)}</span>
          </span>
          <span className="site-friend-category">{friend.category}</span>
        </div>
        <span className="sr-only">在新窗口打开</span>
      </div>
    </CardLink>
  );
}
