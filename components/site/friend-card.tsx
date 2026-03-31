import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function FriendCard({
  name,
  note,
}: {
  name: string;
  note: string;
}) {
  return (
    <Card className={`
      transition-transform duration-[var(--duration-base)]
      hover:-translate-y-1
    `}>
      <CardContent className="flex items-start gap-4 p-0">
        <Avatar>
          <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm leading-7 text-muted">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}
