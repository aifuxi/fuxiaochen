import { toDateString, toTimeString } from "@/lib/common";

export function DateTableCell({ date }: { date: Date }) {
  return (
    <div className="flex flex-col gap-1">
      <span>{toDateString(date)}</span>
      <span className="text-xs text-muted-foreground">
        {toTimeString(date)}
      </span>
    </div>
  );
}
