import { PageHero } from "@/components/shared/page-hero";
import { FriendCard } from "@/components/site/friend-card";

const friends = [
  { name: "Aiko", note: "Design systems, motion and interface craft." },
  { name: "Ming", note: "Distributed systems and applied platform engineering." },
  { name: "Sora", note: "Content strategy, editorial tooling and documentation." },
] as const;

export default function FriendsPage() {
  return (
    <div className={`
      container-shell space-y-10 py-10
      md:py-14
    `}>
      <PageHero
        badge="Friends"
        eyebrow="Network"
        title="Friends and links have their own reusable card pattern."
        description="The original draft had a distinct friend card with avatar, note and soft hover elevation. That pattern now has a dedicated domain component."
      />
      <div className={`
        grid gap-6
        lg:grid-cols-3
      `}>
        {friends.map((friend) => (
          <FriendCard key={friend.name} {...friend} />
        ))}
      </div>
    </div>
  );
}
