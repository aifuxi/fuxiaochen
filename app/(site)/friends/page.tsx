import Link from "next/link";

import { PageIntro } from "@/components/blocks/page-intro";
import { Card } from "@/components/ui/card";
import { friendLinks } from "@/lib/mocks/site-content";

export default function FriendsPage() {
  return (
    <>
      <PageIntro
        description="A small link roll for people and studios with taste in typography, interface restraint, and product craft."
        eyebrow="Friends"
        title="People and places shaping adjacent work."
      />
      <section className={`
        shell-container grid gap-5
        lg:grid-cols-3
      `}>
        {friendLinks.map((friend) => (
          <Link key={friend.name} href={friend.href}>
            <Card className={`
              h-full space-y-4 transition-transform duration-300
              hover:-translate-y-1
            `}>
              <div className="type-label">{friend.note}</div>
              <h2 className="font-serif text-3xl tracking-[-0.05em]">{friend.name}</h2>
              <p className="text-sm leading-6 text-muted">{friend.description}</p>
            </Card>
          </Link>
        ))}
      </section>
    </>
  );
}
