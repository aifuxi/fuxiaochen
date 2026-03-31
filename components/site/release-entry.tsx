import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";

export function ReleaseEntry({
  version,
  status,
  summary,
}: {
  version: string;
  status: "draft" | "live" | "planned";
  summary: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-0">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-mono text-sm font-semibold tracking-[0.2em] uppercase">
            {version}
          </h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm leading-7 text-muted">{summary}</p>
      </CardContent>
    </Card>
  );
}
