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
      <ConfiguredImage src={friend.avatar} size={40} fallback="link" />
      <div>
        <h2 className="ds-title">{friend.name}</h2>
        <p className="ds-body">{friend.description || friend.url}</p>
        <span>{friend.category}</span>
      </div>
    </CardLink>
  );
}
