import { Card, CardContent } from "@/components/ui/card";

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
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="space-y-2 p-0">
            <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              {item.label}
            </div>
            <div className="font-mono text-4xl font-bold text-fg">
              {item.value}
            </div>
            <p className="text-sm text-muted">{item.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
