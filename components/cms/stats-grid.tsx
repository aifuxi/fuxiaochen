import { FileText, MessageSquare, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const icons = [FileText, Users, MessageSquare, TrendingUp] as const;

export function StatsGrid({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <div className={`
      grid gap-4
      md:grid-cols-2
      xl:grid-cols-4
    `}>
      {items.map((item, index) => {
        const Icon = icons[index] ?? TrendingUp;
        return (
          <Card
            key={item.label}
            className={`
              border-white/10 bg-card transition-all duration-300
              hover:-translate-y-1 hover:border-border-h
            `}
          >
            <CardContent className="space-y-3 p-0">
              <div className="flex items-start justify-between gap-4">
                <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                  {item.label}
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="font-mono text-4xl font-bold text-fg">
                {item.value}
              </div>
              <p className="text-sm text-muted">{item.detail}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
