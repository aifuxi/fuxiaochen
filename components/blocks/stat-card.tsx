import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CmsStat } from "@/lib/mocks/cms-content";

const toneMap: Record<CmsStat["tone"], "success" | "warning" | "info"> = {
  info: "info",
  success: "success",
  warning: "warning",
};

export function StatCard({ stat }: { stat: CmsStat }) {
  return (
    <Card className="rounded-[1.7rem]">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="type-label">{stat.title}</div>
          <Badge variant={toneMap[stat.tone]}>{stat.delta}</Badge>
        </div>
        <div className="font-serif text-5xl tracking-[-0.06em]">{stat.value}</div>
      </div>
    </Card>
  );
}
