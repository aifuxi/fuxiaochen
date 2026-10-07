import { ConfiguredImage } from "@/components/frontend/configured-image";
import { CardLink } from "@/components/ui/card";

type FriendCardData = {
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: string;
};

export function FriendLinkCard({ friend }: { friend: FriendCardData }) {
  return (
    <CardLink href={friend.url} target="_blank" rel="noopener noreferrer">
      <span className="site-friend-icon" aria-hidden="true">
        <ConfiguredImage src={friend.avatar} size={32} fallback="link" />
      </span>
      <div>
        <h2 className="ds-title">{friend.name}</h2>
        <p className="ds-body">{friend.description || friend.url}</p>
        <span className="site-friend-category">{friend.category}</span>
      </div>
    </CardLink>
  );
}
